/**
 * Narrow ambient types for the webtorrent@3 API surface this app actually
 * uses. webtorrent ships no first-party types and @types/webtorrent is
 * stuck at the v2 API (mismatched against the v3 runtime we depend on) — see
 * apps/downloader/WEBTORRENT_ARCHITECTURE.md. Extend this file rather than
 * pulling in @types/webtorrent if more of the API is needed later.
 */
declare module "webtorrent" {
  import { EventEmitter } from "node:events";
  import { Readable } from "node:stream";

  export class TorrentFile extends EventEmitter {
    name: string;
    path: string;
    length: number;
    done: boolean;
    select(): void;
    deselect(): void;
    createReadStream(opts?: { start?: number; end?: number }): Readable;
  }

  export interface ChunkStoreCtor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (chunkLength: number, opts: any): unknown;
  }

  export interface TorrentOpts {
    store?: ChunkStoreCtor;
    storeOpts?: Record<string, unknown>;
    path?: string;
    announce?: string[];
    skipVerify?: boolean;
    deselect?: boolean;
    /** Startup bitfield (BitTorrent wire format: MSB-first bits) of pieces already present in the store, used to skip full hash verification. Must be exactly Math.ceil(pieceCount / 8) bytes or WebTorrent silently ignores it. */
    bitfield?: Uint8Array;
  }

  export interface BitFieldLike {
    get(index: number): boolean;
  }

  export interface PeerWire {
    peerId: string;
    remoteAddress?: string;
    remotePort?: number;
    peerPieces: BitFieldLike;
    requests: { piece: number }[];
    peerChoking: boolean;
    amInterested: boolean;
  }

  export class Torrent extends EventEmitter {
    infoHash: string;
    name: string;
    length: number;
    downloaded: number;
    received: number;
    downloadSpeed: number;
    uploadSpeed: number;
    progress: number;
    numPeers: number;
    files: TorrentFile[];
    ready: boolean;
    destroyed: boolean;
    pieces: unknown[];
    bitfield: BitFieldLike;
    wires: PeerWire[];
    select(start: number, end: number, priority?: number): void;
    deselect(start: number, end: number): void;
    destroy(opts?: { destroyStore?: boolean }, cb?: (err?: Error) => void): void;
    /** Private by convention (underscore), not by enforcement — used deliberately to force a piece back to "needs download" when store-write reconciliation finds the bitfield claiming a piece we don't actually have. See webtorrent.client.ts's `verified` handler. */
    _markUnverified(index: number): void;
  }

  export interface ClientOpts {
    dht?: boolean;
    torrentPort?: number;
    dhtPort?: number;
    maxConns?: number;
  }

  export default class WebTorrent extends EventEmitter {
    constructor(opts?: ClientOpts);
    torrents: Torrent[];
    destroyed: boolean;
    add(
      torrentId: string | Buffer,
      opts?: TorrentOpts,
      ontorrent?: (torrent: Torrent) => void
    ): Torrent;
    get(torrentId: string | Buffer): Promise<Torrent | null>;
    remove(
      torrentId: string | Buffer,
      opts?: { destroyStore?: boolean },
      cb?: (err?: Error) => void
    ): Promise<void>;
    destroy(cb?: (err?: Error) => void): void;
  }
}

declare module "parse-torrent" {
  export type ParsedTorrent = {
    infoHash: string;
    name?: string;
    length?: number;
    /** Per-piece hex-encoded SHA1 hashes. Only populated when parsed from full .torrent info (absent for magnet links). */
    pieces?: string[];
  };

  export default function parseTorrent(
    torrentId: string | Buffer
  ): Promise<ParsedTorrent>;
}
