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
  }

  export class Torrent extends EventEmitter {
    infoHash: string;
    name: string;
    length: number;
    downloaded: number;
    downloadSpeed: number;
    uploadSpeed: number;
    progress: number;
    numPeers: number;
    files: TorrentFile[];
    ready: boolean;
    destroyed: boolean;
    select(start: number, end: number, priority?: number): void;
    deselect(start: number, end: number): void;
    destroy(opts?: { destroyStore?: boolean }, cb?: (err?: Error) => void): void;
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
  };

  export default function parseTorrent(
    torrentId: string | Buffer
  ): Promise<ParsedTorrent>;
}
