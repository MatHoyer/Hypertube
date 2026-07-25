import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import { env, IStorageService, S3ChunkStore } from "@hypertube/server-core";
import WebTorrent, { Torrent, TorrentFile } from "webtorrent";

let client: WebTorrent | null = null;

/** Singleton: one DHT/peer swarm per downloader process, shared by every job. */
export const getWebTorrentClient = (): WebTorrent => {
  if (!client) {
    client = new WebTorrent({
      dht: true,
      torrentPort: env.WEBTORRENT_TORRENT_PORT,
    });
    client.on("error", (err) => {
      hypertubeLogger.error(`WebTorrent client error: ${formatUnknownError(err)}`);
    });
  }
  return client;
};

export type AddTorrentOptions = {
  infoHash: string;
  storageService: IStorageService;
};

/**
 * Adds a torrent backed by the S3 chunk store, starting with every file
 * deselected — callers must explicitly select() the file(s) they want.
 * WebTorrent still verifies (and can serve to peers) whatever pieces already
 * exist in the store regardless of selection; deselecting only controls what
 * *we* proactively download.
 */
export const addTorrent = (
  torrentId: string | Buffer,
  { infoHash, storageService }: AddTorrentOptions
): Torrent => {
  const webtorrentClient = getWebTorrentClient();
  const torrent = webtorrentClient.add(torrentId, {
    store: S3ChunkStore,
    storeOpts: { infoHash, storageService },
    deselect: true,
  });
  torrent.on("error", (err) => {
    hypertubeLogger.error(
      `Torrent ${infoHash} error: ${formatUnknownError(err)}`
    );
  });
  return torrent;
};

export const waitForMetadata = (
  torrent: Torrent,
  timeoutMs = 120000
): Promise<TorrentFile[]> => {
  if (torrent.files?.length > 0) return Promise.resolve(torrent.files);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout waiting for torrent metadata"));
    }, timeoutMs);

    const onMetadata = () => {
      cleanup();
      resolve(torrent.files);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      torrent.removeListener("metadata", onMetadata);
      torrent.removeListener("error", onError);
    };

    torrent.once("metadata", onMetadata);
    torrent.once("error", onError);
  });
};

/** Selects exactly one file to download, deselecting every other file in the torrent. */
export const selectOnlyFile = (torrent: Torrent, targetFile: TorrentFile): void => {
  torrent.files.forEach((file) => {
    if (file === targetFile) file.select();
    else file.deselect();
  });
};

/**
 * Resolves once `targetFile` itself is fully downloaded. Deliberately listens
 * on the file's own 'done' event rather than torrent-level 'done': when other
 * files in a multi-file torrent stay deselected forever, torrent-level 'done'
 * never fires (WebTorrent only marks the torrent done once *every* file is
 * done), but the per-file 'done' event fires independently as soon as that
 * file's own pieces are all verified.
 */
export const waitForFileDone = (
  torrent: Torrent,
  targetFile: TorrentFile,
  timeoutMs = 1000000
): Promise<void> => {
  if (targetFile.done) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout waiting for torrent download to finish"));
    }, timeoutMs);

    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      targetFile.removeListener("done", onDone);
      torrent.removeListener("error", onError);
    };

    targetFile.once("done", onDone);
    torrent.once("error", onError);
  });
};

export type StallWatchdogHandle = { stop: () => void };

/**
 * Equivalent of the old Transmission client's isTorrentStalled: if downloaded
 * bytes haven't advanced for `timeoutMs`, calls onStalled once. No built-in
 * "stopped" torrent status exists in WebTorrent (unlike Transmission's RPC
 * status enum), so we track progress ourselves.
 */
export const watchForStall = (
  torrent: Torrent,
  {
    timeoutMs = 120000,
    pollIntervalMs = 15000,
    onStalled,
  }: {
    timeoutMs?: number;
    pollIntervalMs?: number;
    onStalled: () => void;
  }
): StallWatchdogHandle => {
  let lastDownloaded = torrent.downloaded;
  let lastProgressAt = Date.now();

  const interval = setInterval(() => {
    if (torrent.destroyed) return;
    if (torrent.downloaded > lastDownloaded) {
      lastDownloaded = torrent.downloaded;
      lastProgressAt = Date.now();
      return;
    }
    if (Date.now() - lastProgressAt > timeoutMs) {
      onStalled();
    }
  }, pollIntervalMs);

  return { stop: () => clearInterval(interval) };
};

const seeds = new Map<string, Torrent>();

/** Keeps a torrent alive as a seed after its download/upload job has finished. */
export const registerSeed = (torrent: Torrent): void => {
  seeds.set(torrent.infoHash, torrent);
};

export const isSeeding = (infoHash: string): boolean => seeds.has(infoHash);

export const listSeedingInfoHashes = (): string[] => [...seeds.keys()];

/** Detaches a torrent from the in-memory client. Never deletes S3 data — see S3ChunkStore#destroy. */
export const stopSeeding = (infoHash: string): void => {
  if (!seeds.has(infoHash)) return;
  seeds.delete(infoHash);

  const webtorrentClient = getWebTorrentClient();
  webtorrentClient.remove(infoHash).catch((err: unknown) => {
    hypertubeLogger.error(
      `Error stopping seed ${infoHash}: ${formatUnknownError(err)}`
    );
  });
};
