import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import { EventEmitter } from "node:events";
import TrackerClient from "bittorrent-tracker";
import DHT from "bittorrent-dht";

export type PeerAddress = { host: string; port: number };

export type PeerDiscoveryOptions = {
  infoHash: string;
  /** Announce URLs from the parsed torrent/magnet — may be empty (magnet with no trackers), in which case DHT carries the whole load. */
  announce: string[];
  peerId: string;
  /** Port we advertise to trackers as our listening port (leech-only: nothing actually listens on it, see roadmap "No incoming connections required"). */
  port: number;
  /** Stop accepting newly-discovered candidates once the deduped pool reaches this size — a large swarm would otherwise grow the pool unbounded for the life of the download. Peer connection concurrency (Phase 3) is a separate, usually smaller, concern. */
  maxPeers?: number;
  useDht?: boolean;
};

const DEFAULT_MAX_PEERS = 200;

/** Splits a tracker "peer" event's "host:port" string. IPv6 literals aren't a concern here — all trackers/peers this app talks to are plain IPv4. */
const parseAddr = (addr: string): PeerAddress | null => {
  const separatorIndex = addr.lastIndexOf(":");
  if (separatorIndex === -1) return null;
  const host = addr.slice(0, separatorIndex);
  const port = Number.parseInt(addr.slice(separatorIndex + 1), 10);
  if (!host || !Number.isFinite(port) || port <= 0) return null;
  return { host, port };
};

/**
 * Merges tracker announces and DHT lookups into one deduped peer pool,
 * emitting 'peer' once per newly-seen address until the cap is hit. Peer
 * connection dial-out and retry-on-disconnect (pulling the next candidate)
 * is peer-connection.ts's job (Phase 3) — this module only ever discovers
 * and forwards, it doesn't track connection state.
 */
export class PeerDiscovery extends EventEmitter {
  private readonly seen = new Set<string>();
  private readonly tracker: TrackerClient | null;
  private readonly dht: DHT | null;
  private readonly maxPeers: number;
  private destroyed = false;

  constructor({
    infoHash,
    announce,
    peerId,
    port,
    maxPeers = DEFAULT_MAX_PEERS,
    useDht = true,
  }: PeerDiscoveryOptions) {
    super();
    this.maxPeers = maxPeers;

    this.tracker =
      announce.length > 0
        ? new TrackerClient({ infoHash, peerId, announce, port })
        : null;
    if (this.tracker) {
      this.tracker.on("peer", (addr) => this.handleCandidate(addr));
      this.tracker.on("warning", (err) => {
        hypertubeLogger.warn(
          `Tracker warning for ${infoHash}: ${formatUnknownError(err)}`
        );
      });
      this.tracker.on("error", (err) => {
        hypertubeLogger.error(
          `Tracker error for ${infoHash}: ${formatUnknownError(err)}`
        );
      });
      this.tracker.start();
    }

    this.dht = useDht ? new DHT() : null;
    if (this.dht) {
      this.dht.on("peer", (peer) => this.handleCandidate(peer));
      this.dht.on("error", (err) => {
        hypertubeLogger.error(
          `DHT error for ${infoHash}: ${formatUnknownError(err)}`
        );
      });
      this.dht.listen(() => {
        this.dht?.lookup(infoHash, (err) => {
          if (err) {
            hypertubeLogger.warn(
              `DHT lookup failed for ${infoHash}: ${formatUnknownError(err)}`
            );
          }
        });
      });
    }
  }

  private handleCandidate(candidate: PeerAddress | string): void {
    if (this.destroyed || this.seen.size >= this.maxPeers) return;
    const peer =
      typeof candidate === "string" ? parseAddr(candidate) : candidate;
    if (!peer) return;

    const key = `${peer.host}:${peer.port}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.emit("peer", peer);
  }

  /** Re-announces to trackers and re-runs a DHT lookup — use when the connection pool is starved for candidates (e.g. every existing peer disconnected). */
  refresh(infoHash: string): void {
    if (this.destroyed) return;
    this.tracker?.update();
    this.dht?.lookup(infoHash);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.tracker?.destroy();
    this.dht?.destroy();
  }
}
