import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { open, type FileHandle } from "node:fs/promises";
import { BLOCK_LENGTH, PeerConnection, PeerConnectionPool } from "./peer-connection.js";
import type { TorrentFileMeta, TorrentMetadata } from "./metadata.js";

type PieceState = "needed" | "in-flight" | "done";

const MAX_IN_FLIGHT_PER_PEER = 5;
const BLOCK_PIPELINE_DEPTH = 4;

export type PieceManagerOptions = {
  metadata: TorrentMetadata;
  /** The one file within the torrent we actually want — every piece outside its byte range is never requested. */
  targetFile: TorrentFileMeta;
  /** Local path this file's bytes get written to, sized exactly targetFile.length. Caller owns cleanup. */
  scratchFilePath: string;
  pool: PeerConnectionPool;
};

/**
 * The core download engine: assigns needed pieces to available unchoked
 * peers, requests their blocks, verifies each completed piece against its
 * SHA1 hash, and writes the verified bytes into the scratch file at the
 * right file-relative offset. Piece selection is deliberately simple
 * (sequential, lowest-needed-index-first) — rarest-first/endgame are
 * roadmap bonus-tier, not required for correctness.
 */
export class PieceManager extends EventEmitter {
  private readonly metadata: TorrentMetadata;
  private readonly targetFile: TorrentFileMeta;
  private readonly scratchFilePath: string;
  private readonly pool: PeerConnectionPool;

  private readonly neededPieceIndices: number[];
  private readonly pieceState = new Map<number, PieceState>();
  private readonly inFlightPerPeer = new Map<PeerConnection, number>();
  /** Peers whose last attempt at a given piece failed a hash check — deprioritized (not banned) for that piece so a retry prefers a different source. */
  private readonly failedPeersByPiece = new Map<number, Set<PeerConnection>>();
  private readonly peers = new Set<PeerConnection>();

  private fileHandle: FileHandle | null = null;
  private verifiedCount = 0;
  private destroyed = false;
  private doneEmitted = false;

  constructor({ metadata, targetFile, scratchFilePath, pool }: PieceManagerOptions) {
    super();
    this.metadata = metadata;
    this.targetFile = targetFile;
    this.scratchFilePath = scratchFilePath;
    this.pool = pool;
    this.neededPieceIndices = this.computeNeededPieceIndices();
    for (const index of this.neededPieceIndices) this.pieceState.set(index, "needed");
  }

  private computeNeededPieceIndices(): number[] {
    const { pieceLength, pieces } = this.metadata;
    const fileStart = this.targetFile.offset;
    const fileEnd = fileStart + this.targetFile.length;
    const indices: number[] = [];
    for (let index = 0; index < pieces.length; index++) {
      const pieceStart = index * pieceLength;
      const pieceEnd = pieceStart + this.pieceByteLength(index);
      if (pieceEnd > fileStart && pieceStart < fileEnd) indices.push(index);
    }
    return indices;
  }

  private pieceByteLength(index: number): number {
    const { pieceLength, lastPieceLength, pieces } = this.metadata;
    return index === pieces.length - 1 ? lastPieceLength : pieceLength;
  }

  async start(): Promise<void> {
    this.fileHandle = await open(this.scratchFilePath, "w+");

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

  private async writePiece(index: number, pieceBuffer: Buffer): Promise<void> {
    const pieceGlobalStart = index * this.metadata.pieceLength;
    const pieceGlobalEnd = pieceGlobalStart + pieceBuffer.length;
    const fileStart = this.targetFile.offset;
    const fileEnd = fileStart + this.targetFile.length;

    const writeStart = Math.max(pieceGlobalStart, fileStart);
    const writeEnd = Math.min(pieceGlobalEnd, fileEnd);
    if (writeStart >= writeEnd) return; // piece entirely outside target file — shouldn't happen given computeNeededPieceIndices, but harmless if it does

    const slice = pieceBuffer.subarray(
      writeStart - pieceGlobalStart,
      writeEnd - pieceGlobalStart
    );
    const position = writeStart - fileStart;
    if (!this.fileHandle) {
      throw new Error(`Scratch file handle missing while writing piece ${index}`);
    }
    await this.fileHandle.write(slice, 0, slice.length, position);
  }

  private finish(): void {
    if (this.doneEmitted) return;
    this.doneEmitted = true;
    this.emit("done");
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    await this.fileHandle?.close();
    this.fileHandle = null;
  }
}
