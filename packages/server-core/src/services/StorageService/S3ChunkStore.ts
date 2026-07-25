import { buffer } from "node:stream/consumers";
import { BUCKETS, getTorrentPieceObjectName } from "./const.js";
import { IStorageService } from "./IStorageService.js";

export type TS3ChunkStoreOpts = {
  infoHash: string;
  storageService: IStorageService;
  [key: string]: unknown;
};

type TChunkStoreGetOpts = { offset?: number; length?: number };
type TChunkStoreCallback<T = void> = (
  err: Error | null,
  result?: T
) => void;

/**
 * abstract-chunk-store compatible store that persists raw torrent piece data
 * to S3/MinIO instead of local disk, keyed by infoHash + piece index. See
 * apps/downloader/WEBTORRENT_ARCHITECTURE.md (Decision C) for why this is
 * hand-rolled and why resume-on-restart needs no extra code here: WebTorrent's
 * own Storage layer hash-verifies whatever `get()` returns on load.
 *
 * Instantiated by WebTorrent itself via `new opts.store(pieceLength, {...})`,
 * so the constructor signature is fixed by that contract, not by us.
 */
export class S3ChunkStore {
  chunkLength: number;
  closed = false;

  private readonly infoHash: string;
  private readonly storageService: IStorageService;

  constructor(chunkLength: number, opts: TS3ChunkStoreOpts) {
    if (!chunkLength) throw new Error("First argument must be a chunk length");
    if (!opts?.infoHash) throw new Error("`infoHash` option is required");
    if (!opts?.storageService)
      throw new Error("`storageService` option is required");

    this.chunkLength = Number(chunkLength);
    this.infoHash = opts.infoHash;
    this.storageService = opts.storageService;
  }

  private objectName(index: number): string {
    return getTorrentPieceObjectName(this.infoHash, index);
  }

  put(index: number, buf: Buffer, cb: TChunkStoreCallback = () => {}): void {
    if (this.closed) {
      queueMicrotask(() => cb(new Error("Storage is closed")));
      return;
    }

    this.storageService
      .putObject(
        BUCKETS.TORRENT_PIECES,
        this.objectName(index),
        buf,
        buf.length
      )
      .then(() => cb(null))
      .catch((err: unknown) =>
        cb(err instanceof Error ? err : new Error(String(err)))
      );
  }

  get(
    index: number,
    opts: TChunkStoreGetOpts | TChunkStoreCallback<Buffer>,
    cb?: TChunkStoreCallback<Buffer>
  ): void {
    if (typeof opts === "function") {
      this.get(index, {}, opts);
      return;
    }
    const callback = cb as TChunkStoreCallback<Buffer>;

    if (this.closed) {
      queueMicrotask(() => callback(new Error("Storage is closed")));
      return;
    }

    const offset = opts.offset ?? 0;

    this.storageService
      .getPartialObject(
        BUCKETS.TORRENT_PIECES,
        this.objectName(index),
        offset,
        opts.length
      )
      .then((stream) => buffer(stream))
      .then((buf) => callback(null, buf))
      .catch((err: unknown) =>
        callback(err instanceof Error ? err : new Error(String(err)))
      );
  }

  close(cb: TChunkStoreCallback = () => {}): void {
    this.closed = true;
    queueMicrotask(() => cb(null));
  }

  /**
   * Deliberately does not delete any S3 objects: the monthly cleanup cron
   * (apps/scheduler/src/crons/deleteMoviesMonthly.ts) owns deleting the
   * `torrent-pieces/<infoHash>/` prefix, and it always does so before the
   * downloader is told to stop seeding. Deleting again here would just be a
   * redundant list+delete race with no data-loss benefit.
   */
  destroy(cb: TChunkStoreCallback = () => {}): void {
    this.close(cb);
  }
}
