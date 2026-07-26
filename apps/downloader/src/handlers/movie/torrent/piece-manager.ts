import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { open, type FileHandle } from "node:fs/promises";
import { BLOCK_LENGTH, PeerConnection, PeerConnectionPool } from "./peer-connection.js";
import type { TorrentFileMeta, TorrentMetadata } from "./metadata.js";

type PieceState = "needed" | "in-flight" | "done";

const MAX_IN_FLIGHT_PER_PEER = 5;
const BLOCK_PIPELINE_DEPTH = 4;

export type TargetFile = {
  file: TorrentFileMeta;
  /** Local path this file's bytes get written to, sized exactly file.length. Caller owns cleanup. */
  scratchFilePath: string;
};

export type PieceManagerOptions = {
  metadata: TorrentMetadata;
  /** Every file within the torrent we actually want (typically the video plus any sidecar subtitle files) — every piece outside all of their byte ranges is never requested. */
  targetFiles: TargetFile[];
  pool: PeerConnectionPool;
};

/**
 * The core download engine: assigns needed pieces to available unchoked
 * peers, requests their blocks, verifies each completed piece against its
 * SHA1 hash, and writes the verified bytes into every target file it
 * overlaps, at each file's own relative offset. Piece selection is
 * deliberately simple (sequential, lowest-needed-index-first) —
 * rarest-first/endgame are roadmap bonus-tier, not required for correctness.
 */
export class PieceManager extends EventEmitter {
  private readonly metadata: TorrentMetadata;
  private readonly targetFiles: TargetFile[];
  private readonly pool: PeerConnectionPool;

  private readonly neededPieceIndices: number[];
  private readonly pieceState = new Map<number, PieceState>();
  private readonly inFlightPerPeer = new Map<PeerConnection, number>();
  /** Peers whose last attempt at a given piece failed a hash check — deprioritized (not banned) for that piece so a retry prefers a different source. */
  private readonly failedPeersByPiece = new Map<number, Set<PeerConnection>>();
  private readonly peers = new Set<PeerConnection>();

  private readonly fileHandles = new Map<TargetFile, FileHandle>();
  private verifiedCount = 0;
  private destroyed = false;
  private doneEmitted = false;

  constructor({ metadata, targetFiles, pool }: PieceManagerOptions) {
    super();
    this.metadata = metadata;
    this.targetFiles = targetFiles;
    this.pool = pool;
    this.neededPieceIndices = this.computeNeededPieceIndices();
    for (const index of this.neededPieceIndices) this.pieceState.set(index, "needed");
  }

  private computeNeededPieceIndices(): number[] {
    const { pieceLength, pieces } = this.metadata;
    const indices: number[] = [];
    for (let index = 0; index < pieces.length; index++) {
      const pieceStart = index * pieceLength;
      const pieceEnd = pieceStart + this.pieceByteLength(index);
      const overlapsAnyTarget = this.targetFiles.some(({ file }) => {
        const fileStart = file.offset;
        const fileEnd = fileStart + file.length;
        return pieceEnd > fileStart && pieceStart < fileEnd;
      });
      if (overlapsAnyTarget) indices.push(index);
    }
    return indices;
  }

  private pieceByteLength(index: number): number {
    const { pieceLength, lastPieceLength, pieces } = this.metadata;
    return index === pieces.length - 1 ? lastPieceLength : pieceLength;
  }

  async start(): Promise<void> {
    for (const target of this.targetFiles) {
      this.fileHandles.set(target, await open(target.scratchFilePath, "w+"));
    }

    if (this.neededPieceIndices.length === 0) {
      this.finish();
      return;
    }

    this.pool.on("wire", (connection) => this.handleNewPeer(connection));
    this.scheduleMore();
  }

  private handleNewPeer(connection: PeerConnection): void {
    if (this.destroyed) return;
    this.peers.add(connection);
    this.inFlightPerPeer.set(connection, 0);
    connection.wire.interested();

    const onUnchoke = () => this.scheduleMore();
    const onBitfieldOrHave = () => this.scheduleMore();
    connection.wire.on("unchoke", onUnchoke);
    connection.wire.on("bitfield", onBitfieldOrHave);
    connection.wire.on("have", onBitfieldOrHave);

    const cleanup = () => {
      this.peers.delete(connection);
      this.inFlightPerPeer.delete(connection);
    };
    connection.once("close", cleanup);
    connection.once("error", cleanup);

    this.scheduleMore();
  }

  private pickPeerFor(index: number): PeerConnection | null {
    const excluded = this.failedPeersByPiece.get(index);
    let fallback: PeerConnection | null = null;
    for (const peer of this.peers) {
      if (peer.wire.peerChoking) continue;
      if (!peer.wire.peerPieces.get(index)) continue;
      const inFlight = this.inFlightPerPeer.get(peer) ?? 0;
      if (inFlight >= MAX_IN_FLIGHT_PER_PEER) continue;
      if (excluded?.has(peer)) {
        fallback ??= peer;
        continue;
      }
      return peer;
    }
    return fallback;
  }

  private scheduleMore(): void {
    if (this.destroyed) return;
    for (const index of this.neededPieceIndices) {
      if (this.pieceState.get(index) !== "needed") continue;
      const peer = this.pickPeerFor(index);
      if (!peer) continue;
      this.pieceState.set(index, "in-flight");
      this.inFlightPerPeer.set(peer, (this.inFlightPerPeer.get(peer) ?? 0) + 1);
      this.downloadPiece(peer, index).finally(() => {
        this.inFlightPerPeer.set(peer, Math.max(0, (this.inFlightPerPeer.get(peer) ?? 1) - 1));
        this.scheduleMore();
      });
    }
  }

  private async downloadPiece(peer: PeerConnection, index: number): Promise<void> {
    const pieceLength = this.pieceByteLength(index);
    const blockCount = Math.ceil(pieceLength / BLOCK_LENGTH);
    const blocks: Buffer[] = new Array(blockCount);

    try {
      let cursor = 0;
      const worker = async () => {
        while (cursor < blockCount) {
          const blockIndex = cursor++;
          const offset = blockIndex * BLOCK_LENGTH;
          const length = Math.min(BLOCK_LENGTH, pieceLength - offset);
          blocks[blockIndex] = await peer.requestBlock(index, offset, length);
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(BLOCK_PIPELINE_DEPTH, blockCount) }, worker)
      );

      const pieceBuffer = Buffer.concat(blocks, pieceLength);
      const hash = createHash("sha1").update(pieceBuffer).digest("hex");
      if (hash !== this.metadata.pieces[index]) {
        hypertubeLogger.warn(
          `Torrent ${this.metadata.infoHash}: piece ${index} failed hash verification from ${peer.address.host}:${peer.address.port} — re-requesting from a different peer`
        );
        let excluded = this.failedPeersByPiece.get(index);
        if (!excluded) {
          excluded = new Set();
          this.failedPeersByPiece.set(index, excluded);
        }
        excluded.add(peer);
        this.pieceState.set(index, "needed");
        return;
      }

      await this.writePiece(index, pieceBuffer);
      this.pieceState.set(index, "done");
      this.failedPeersByPiece.delete(index);
      this.verifiedCount++;
      this.emit("progress", {
        verifiedPieces: this.verifiedCount,
        totalPieces: this.neededPieceIndices.length,
      });
      if (this.verifiedCount === this.neededPieceIndices.length) this.finish();
    } catch (error) {
      hypertubeLogger.warn(
        `Torrent ${this.metadata.infoHash}: piece ${index} request to ${peer.address.host}:${peer.address.port} failed: ${formatUnknownError(error)} — re-requesting`
      );
      this.pieceState.set(index, "needed");
    }
  }

  /** Writes the verified piece into every target file it overlaps — a piece can span a skipped neighboring file, or (rarely) the boundary between two target files. */
  private async writePiece(index: number, pieceBuffer: Buffer): Promise<void> {
    const pieceGlobalStart = index * this.metadata.pieceLength;
    const pieceGlobalEnd = pieceGlobalStart + pieceBuffer.length;

    for (const target of this.targetFiles) {
      const fileStart = target.file.offset;
      const fileEnd = fileStart + target.file.length;

      const writeStart = Math.max(pieceGlobalStart, fileStart);
      const writeEnd = Math.min(pieceGlobalEnd, fileEnd);
      if (writeStart >= writeEnd) continue;

      const slice = pieceBuffer.subarray(
        writeStart - pieceGlobalStart,
        writeEnd - pieceGlobalStart
      );
      const position = writeStart - fileStart;
      const fileHandle = this.fileHandles.get(target);
      if (!fileHandle) {
        throw new Error(
          `Scratch file handle missing for ${target.scratchFilePath} while writing piece ${index}`
        );
      }
      await fileHandle.write(slice, 0, slice.length, position);
    }
  }

  private finish(): void {
    if (this.doneEmitted) return;
    this.doneEmitted = true;
    this.emit("done");
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    await Promise.all(
      [...this.fileHandles.values()].map((handle) => handle.close())
    );
    this.fileHandles.clear();
  }
}
