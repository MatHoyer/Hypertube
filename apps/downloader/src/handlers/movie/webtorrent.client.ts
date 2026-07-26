import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import {
  BUCKETS,
  env,
  IStorageService,
  S3ChunkStore,
} from "@hypertube/server-core";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import WebTorrent, { Torrent, TorrentFile } from "webtorrent";

// gluetun (VPN_PORT_FORWARDING=on) writes ProtonVPN's dynamically assigned,
// publicly-reachable port here a few seconds after the tunnel comes up —
// see docker-compose-vpn.yml. Shared with this container via the
// gluetun_data volume, since we're in gluetun's network namespace
// (network_mode: container:vpn) but not its filesystem.
const GLUETUN_FORWARDED_PORT_FILE = "/tmp/gluetun/forwarded_port";
const FORWARDED_PORT_WAIT_TIMEOUT_MS = 30000;
const FORWARDED_PORT_POLL_INTERVAL_MS = 1000;

/**
 * Without a forwarded port we're outbound-connections-only: nothing on the
 * internet can reach us, which starves peer discovery — this is the gap
 * that made the old Transmission setup (settings.json had
 * port-forwarding-enabled: true) find real peers where a plain outbound-only
 * WebTorrent client mostly doesn't. Falls back to the static
 * WEBTORRENT_TORRENT_PORT (still outbound-only) if the file never appears —
 * e.g. VPN_PORT_FORWARDING isn't set, or a non-gluetun dev setup.
 */
const readForwardedPort = async (): Promise<number | null> => {
  const deadline = Date.now() + FORWARDED_PORT_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const raw = (
        await fs.readFile(GLUETUN_FORWARDED_PORT_FILE, "utf-8")
      ).trim();
      const port = Number.parseInt(raw, 10);
      if (Number.isFinite(port) && port > 0) return port;
    } catch {
      // File not written yet — gluetun negotiates it a few seconds after
      // the tunnel comes up. Keep polling until the timeout.
    }
    await new Promise((resolve) =>
      setTimeout(resolve, FORWARDED_PORT_POLL_INTERVAL_MS)
    );
  }
  hypertubeLogger.error(
    `No VPN forwarded port found after ${FORWARDED_PORT_WAIT_TIMEOUT_MS}ms, falling back to static WEBTORRENT_TORRENT_PORT (outbound-only)`
  );
  return null;
};

let clientPromise: Promise<WebTorrent> | null = null;

/** Singleton: one DHT/peer swarm per downloader process, shared by every job. */
export const getWebTorrentClient = (): Promise<WebTorrent> => {
  if (!clientPromise) {
    clientPromise = (async () => {
      const forwardedPort = await readForwardedPort();
      const torrentPort = forwardedPort ?? env.WEBTORRENT_TORRENT_PORT;
      hypertubeLogger.info(
        `WebTorrent client listening on port ${torrentPort}${
          forwardedPort ? " (VPN-forwarded, reachable inbound)" : " (static, outbound-only)"
        }`
      );

      const webtorrentClient = new WebTorrent({ dht: true, torrentPort });
      webtorrentClient.on("error", (err) => {
        hypertubeLogger.error(
          `WebTorrent client error: ${formatUnknownError(err)}`
        );
      });
      return webtorrentClient;
    })();
  }
  return clientPromise;
};

export type AddTorrentOptions = {
  infoHash: string;
  storageService: IStorageService;
  /** Per-piece hex SHA1 hashes from the full .torrent info (parseTorrent's `pieces`). Absent for magnet-only adds, which have no piece hashes upfront — see buildVerifiedBitfield. */
  pieces?: string[];
};

const BITFIELD_VERIFY_CONCURRENCY = 16;

/**
 * Builds a correctly-sized BitTorrent-format startup bitfield (MSB-first
 * bits, matching the `bitfield` package WebTorrent itself uses internally)
 * by verifying whatever already exists in the S3 store *ourselves*, rather
 * than delegating to WebTorrent's own internal verify paths.
 *
 * Both of WebTorrent@3.0.16's own options turned out unreliable for this
 * S3-backed setup:
 *  - `_verifyPiecesUsingBitfield` ("trust the bitfield, spot-check one piece
 *    per file") has a real crash bug this repo already patches around
 *    (`patches/webtorrent@3.0.16.patch`) — a spot-check piece shared across
 *    files, or one the optimistic pass never revisits, can leave
 *    `bitfield.get(index) === false` while `pieces[index]` stays `null`.
 *  - `_verifyPiecesUsingHash` (the fallback used when no startup bitfield is
 *    given at all) was assumed "slower but well-tested" — live testing
 *    instead found its piece-verified count oscillating by 100+ pieces
 *    across successive ticks on a real resumed download, never converging,
 *    with `done` never firing even once every piece was genuinely correct
 *    in the store. Root cause not pinned down further; not relied on anymore.
 *
 * Instead: for every piece object that exists in the store, fetch it and
 * SHA1-hash it against the known-good hash from the .torrent info ourselves
 * (bounded concurrency — hundreds of pieces would be slow fully serial).
 * A wrong-size or corrupted object simply won't match and is left
 * unverified (bit stays 0, gets normally re-downloaded from peers) — no
 * separate length check needed, the hash comparison already implies it.
 * The resulting bitfield is *never* `undefined`: with it always supplied,
 * WebTorrent always takes the fast, now-patched `_verifyPiecesUsingBitfield`
 * path (a full no-op for a genuinely fresh download, since nothing in the
 * store means nothing to spot-check), instead of ever hitting the
 * problematic full-hash-verify fallback.
 */
const buildVerifiedBitfield = async (
  infoHash: string,
  pieces: string[],
  storageService: IStorageService
): Promise<{ bitfield: Uint8Array; unverifiedIndices: number[] }> => {
  const bitfield = new Uint8Array(Math.ceil(pieces.length / 8));
  const existingObjectNames = new Set(
    await storageService.listObjectNamesByPrefix(
      BUCKETS.TORRENT_PIECES,
      `${infoHash}/`
    )
  );
  if (existingObjectNames.size === 0) {
    return {
      bitfield,
      unverifiedIndices: pieces.map((_, index) => index),
    };
  }

  const setBit = (index: number) => {
    bitfield[index >> 3] |= 0x80 >> index % 8;
  };

  let cursor = 0;
  const worker = async () => {
    while (cursor < pieces.length) {
      const index = cursor++;
      const objectName = `${infoHash}/${index}`;
      if (!existingObjectNames.has(objectName)) continue;
      try {
        const stream = await storageService.getObject(
          BUCKETS.TORRENT_PIECES,
          objectName
        );
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk as Buffer);
        }
        const hash = createHash("sha1").update(Buffer.concat(chunks)).digest("hex");
        if (hash === pieces[index]) setBit(index);
      } catch (error) {
        hypertubeLogger.error(
          `Failed to self-verify piece ${index} for ${infoHash}: ${formatUnknownError(error)}`
        );
      }
    }
  };
  await Promise.all(
    Array.from({ length: BITFIELD_VERIFY_CONCURRENCY }, worker)
  );

  const unverifiedIndices: number[] = [];
  for (let index = 0; index < pieces.length; index++) {
    const byte = bitfield[index >> 3];
    if (!(byte & (0x80 >> index % 8))) unverifiedIndices.push(index);
  }
  return { bitfield, unverifiedIndices };
};

const RECONCILE_INTERVAL_MS = 20000;

/**
 * Periodically re-confirms, against S3 directly, that pieces WebTorrent's
 * bitfield claims to have verified during this session (i.e. not part of
 * the startup self-verify — those were already hash-checked once) actually
 * exist in the store. Companion to the "verified" event listener in
 * addTorrent: that one is reactive (should catch it the moment a piece
 * flips), but a real, reproduced case was observed where a piece's bitfield
 * bit flipped to true with no "verified" event ever firing — root cause not
 * found despite reading every `bitfield.set`/`_markVerified` call site in
 * the library. This sweep is deliberately not event-based, so it catches
 * that case regardless of mechanism. Scoped to only the pieces that needed
 * fresh download (typically a small set) to keep the cost bounded — this
 * is not a full-torrent re-verify.
 */
const startReconciliationSweep = (
  torrent: Torrent,
  infoHash: string,
  candidateIndices: number[],
  storageService: IStorageService
): (() => void) => {
  if (candidateIndices.length === 0) return () => {};

  const pending = new Set(candidateIndices);
  const interval = setInterval(() => {
    if (torrent.destroyed || pending.size === 0) return;
    for (const index of pending) {
      if (!torrent.bitfield.get(index)) continue;
      storageService
        .statObject(BUCKETS.TORRENT_PIECES, `${infoHash}/${index}`)
        .then(() => pending.delete(index))
        .catch(() => {
          hypertubeLogger.warn(
            `Torrent ${infoHash}: piece ${index} bitfield says verified but store reconciliation found it missing — forcing re-download`
          );
          torrent._markUnverified(index);
        });
    }
  }, RECONCILE_INTERVAL_MS);

  return () => clearInterval(interval);
};

/**
 * Adds a torrent backed by the S3 chunk store, starting with every file
 * deselected — callers must explicitly select() the file(s) they want.
 * WebTorrent still verifies (and can serve to peers) whatever pieces already
 * exist in the store regardless of selection; deselecting only controls what
 * *we* proactively download.
 */
export const addTorrent = async (
  torrentId: string | Buffer,
  { infoHash, storageService, pieces }: AddTorrentOptions
): Promise<Torrent> => {
  const webtorrentClient = await getWebTorrentClient();
  const verified = pieces
    ? await buildVerifiedBitfield(infoHash, pieces, storageService)
    : undefined;
  const torrent = webtorrentClient.add(torrentId, {
    store: S3ChunkStore,
    storeOpts: { infoHash, storageService },
    deselect: true,
    bitfield: verified?.bitfield,
  });
  torrent.on("error", (err) => {
    hypertubeLogger.error(
      `Torrent ${infoHash} error: ${formatUnknownError(err)}`
    );
  });
  // webtorrent emits this on hash-verification failure (torrent.js's
  // _request chunk handler) and just silently resets+re-requests the piece
  // — with no listener, a piece stuck in a fail/retry loop is invisible.
  torrent.on("warning", (err) => {
    hypertubeLogger.warn(
      `Torrent ${infoHash} warning: ${formatUnknownError(err)}`
    );
  });
  // Reconciliation against a real, observed bug: webtorrent's own bitfield
  // occasionally reports a piece as verified when the corresponding S3
  // object was never actually (durably) written — root cause not pinned
  // down despite deep investigation (only one `_markUnverified` call site
  // exists in the library and isn't reachable for this piece in normal
  // post-startup operation, yet the bitfield bit was observed flipping back
  // to false on its own). Whatever the exact mechanism, the practical
  // effect is a permanently stuck piece: webtorrent's own `_request` refuses
  // to ever re-request an index its bitfield already claims to have. Rather
  // than rely on that internal state, independently confirm the object
  // landed right after every "verified" event, and force it back to
  // "needs download" via the same private method webtorrent itself uses
  // when it decides a piece is genuinely invalid.
  torrent.on("verified", (index: number) => {
    storageService
      .statObject(BUCKETS.TORRENT_PIECES, `${infoHash}/${index}`)
      .catch(() => {
        hypertubeLogger.warn(
          `Torrent ${infoHash}: piece ${index} marked verified but not found in store — forcing re-download`
        );
        torrent._markUnverified(index);
      });
  });
  if (verified) {
    const stopReconciliation = startReconciliationSweep(
      torrent,
      infoHash,
      verified.unverifiedIndices,
      storageService
    );
    torrent.once("close", stopReconciliation);
  }
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

/** Selects exactly the given files to download, deselecting every other file in the torrent. */
export const selectFiles = (torrent: Torrent, wantedFiles: TorrentFile[]): void => {
  torrent.files.forEach((file) => {
    if (wantedFiles.includes(file)) file.select();
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
 * Equivalent of the old Transmission client's isTorrentStalled: if no bytes
 * have arrived from peers for `timeoutMs`, calls onStalled once. No built-in
 * "stopped" torrent status exists in WebTorrent (unlike Transmission's RPC
 * status enum), so we track progress ourselves.
 *
 * Deliberately uses torrent.received, not torrent.downloaded/.progress:
 * `downloaded` only counts *fully verified pieces*, which — for large
 * pieces on a slow swarm — can legitimately take longer than a reasonable
 * stall window to increment even while data is actively (if slowly)
 * trickling in, producing false positives. `received` is a plain counter
 * incremented per chunk received from any peer, independent of piece
 * completion, so it reflects real forward progress at a much finer grain.
 * It's also a plain property, not a getter computed from pieces[index] like
 * .downloaded/.progress are, so it doesn't carry their transient-throw risk
 * (see the pieces[index]/async-sha1 note on readReceivedSafely below) —
 * kept defensive anyway since we can't be certain webtorrent won't change.
 */
const readReceivedSafely = (torrent: Torrent): number | null => {
  try {
    return torrent.received;
  } catch (error) {
    hypertubeLogger.error(
      `Transient error reading torrent.received: ${formatUnknownError(error)}`
    );
    return null;
  }
};

/**
 * Counts verified pieces via the bitfield rather than torrent.downloaded
 * (which reads pieces[index] internally and carries the same transient-throw
 * risk documented on readReceivedSafely/the webtorrent patch) — bitfield.get
 * is a plain, safe lookup.
 */
const countVerifiedPieces = (torrent: Torrent): number => {
  let count = 0;
  for (let i = 0; i < torrent.pieces.length; i++) {
    if (torrent.bitfield.get(i)) count++;
  }
  return count;
};

export const watchForStall = (
  torrent: Torrent,
  {
    timeoutMs = 120000,
    pollIntervalMs = 15000,
    // Observed live: a torrent can sit at ~100% of torrent.received (bytes)
    // indefinitely because peers keep resending data for pieces we already
    // have (endgame/duplicate traffic), while a handful of distinct pieces
    // never actually complete — received-based stall detection never fires
    // since the byte counter keeps climbing. This second, much longer
    // window catches that case specifically: it only cares whether the
    // *count of verified pieces* is moving, which duplicate bytes can't
    // fake. Kept far longer than timeoutMs so it doesn't fire on a single
    // legitimately-slow piece (the exact false-positive risk that made us
    // pick torrent.received over torrent.downloaded in the first place).
    pieceStallTimeoutMs = timeoutMs * 5,
    onStalled,
  }: {
    timeoutMs?: number;
    pollIntervalMs?: number;
    pieceStallTimeoutMs?: number;
    onStalled: () => void;
  }
): StallWatchdogHandle => {
  let lastReceived = readReceivedSafely(torrent) ?? 0;
  let lastProgressAt = Date.now();
  let lastVerifiedCount = countVerifiedPieces(torrent);
  let lastPieceProgressAt = Date.now();

  const interval = setInterval(() => {
    if (torrent.destroyed) return;
    // Piece verification (against the startup bitfield, or the full
    // piece-by-piece fallback when no bitfield was supplied) runs before
    // WebTorrent announces to trackers/DHT at all, so nothing can arrive
    // from peers yet regardless of swarm health. Don't burn the stall
    // window on that — reset the clock instead of comparing against it.
    if (!torrent.ready) {
      lastProgressAt = Date.now();
      lastPieceProgressAt = Date.now();
      return;
    }

    const verifiedCount = countVerifiedPieces(torrent);
    if (verifiedCount > lastVerifiedCount) {
      lastVerifiedCount = verifiedCount;
      lastPieceProgressAt = Date.now();
    } else if (Date.now() - lastPieceProgressAt > pieceStallTimeoutMs) {
      onStalled();
      return;
    }

    const received = readReceivedSafely(torrent);
    if (received === null) return;
    if (received > lastReceived) {
      lastReceived = received;
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
export const stopSeeding = async (infoHash: string): Promise<void> => {
  if (!seeds.has(infoHash)) return;
  seeds.delete(infoHash);

  const webtorrentClient = await getWebTorrentClient();
  webtorrentClient.remove(infoHash).catch((err: unknown) => {
    hypertubeLogger.error(
      `Error stopping seed ${infoHash}: ${formatUnknownError(err)}`
    );
  });
};
