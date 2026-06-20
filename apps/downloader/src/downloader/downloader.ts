import { hypertubeLogger } from "@hypertube/libs";
import { env } from "@hypertube/server-core";

const TransmissionStatus = {
  STOPPED: 0,
  DOWNLOADING: 4,
  SEEDING: 6,
} as const;

async function fetchWithSession(
  baseUrl: string,
  body: Record<string, unknown>,
  sessionId: string | null
): Promise<{ response: Response; sessionId: string }> {
  const url = `${baseUrl}/transmission/rpc`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId ? { "X-Transmission-Session-Id": sessionId } : {}),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 409) {
    const newId = res.headers.get("X-Transmission-Session-Id");
    if (!newId) throw new Error("Transmission did not return session ID");
    return fetchWithSession(baseUrl, body, newId);
  }
  if (!res.ok) throw new Error(`Transmission RPC HTTP ${res.status}`);
  return {
    response: res,
    sessionId: sessionId || res.headers.get("X-Transmission-Session-Id") || "",
  };
}

export type TransmissionTorrent = {
  id: number;
  name: string;
  percentDone: number;
  rateDownload: number;
  status: number;
  error?: number;
  errorString?: string;
  files?: TransmissionTorrentFile[];
};

export type TransmissionTorrentFile = {
  name: string;
  length?: number;
  bytesCompleted?: number;
};

export type TransmissionAddOptions = {
  "download-dir"?: string;
  paused?: boolean;
  sequentialDownload?: boolean;
};

class TransmissionClient {
  private readonly baseUrl: string;
  private sessionId: string | null = null;

  constructor(opts?: { host?: string; port?: number }) {
    const host = opts?.host ?? env.TRANSMISSION_HOST;
    const port = opts?.port ?? env.TRANSMISSION_RCP_PORT;
    this.baseUrl = `http://${host}:${port}`;
  }

  private async rpc<T>(args: Record<string, unknown>): Promise<T> {
    const body = {
      method: "torrent-get",
      arguments: {},
      tag: Date.now(),
      ...args,
    };
    const { response, sessionId } = await fetchWithSession(
      this.baseUrl,
      body,
      this.sessionId
    );
    this.sessionId = sessionId;
    const data = (await response.json()) as {
      result?: string | Record<string, unknown>;
      arguments?: Record<string, unknown>;
    };
    if (typeof data.result === "string" && data.result !== "success") {
      throw new Error(`Transmission RPC: ${data.result}`);
    }
    const out =
      data.arguments ??
      (typeof data.result === "object" ? data.result : undefined);
    if (out == null)
      throw new Error(`Transmission RPC error: ${JSON.stringify(data)}`);
    return out as T;
  }

  /** Path must exist on the Transmission container (not the downloader). */
  async addFile(
    filename: string,
    options: TransmissionAddOptions = {}
  ): Promise<{ id: number }> {
    const args = await this.rpc<{
      "torrent-added"?: { id: number; name: string; hashString: string };
      "torrent-duplicate"?: { id: number };
    }>({
      method: "torrent-add",
      arguments: { filename, ...options },
    });
    const added = args["torrent-added"] ?? args["torrent-duplicate"];
    if (!added) {
      hypertubeLogger.error(
        `Transmission torrent-add failed: ${JSON.stringify(args)}`
      );
      throw new Error("Transmission add failed");
    }
    return { id: added.id };
  }

  /** Transmission accepts magnet URIs via the filename field. */
  async addMagnet(
    magnetUrl: string,
    options: TransmissionAddOptions = {}
  ): Promise<{ id: number }> {
    return this.addFile(magnetUrl, options);
  }

  async waitForFiles(
    id: number,
    timeoutMs = 120000,
    intervalMs = 2000
  ): Promise<TransmissionTorrentFile[]> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const info = await this.get(id, ["files"]);
      const files = info.torrents[0]?.files;
      if (files && files.length > 0) return files;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error("Timeout waiting for torrent metadata");
  }

  async waitForDownloadProgress(
    id: number,
    timeoutMs = 600000,
    intervalMs = 2000
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const info = await this.get(id);
      const torrent = info.torrents[0];
      if (!torrent) throw new Error("Torrent not found");

      if (torrent.percentDone > 0 || torrent.status === TransmissionStatus.DOWNLOADING) {
        return;
      }
      if (
        torrent.status === TransmissionStatus.SEEDING ||
        torrent.percentDone >= 0.99
      ) {
        return;
      }
      if (
        torrent.status === TransmissionStatus.STOPPED &&
        torrent.percentDone < 0.01 &&
        torrent.errorString
      ) {
        throw new Error(`Torrent error: ${torrent.errorString}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error("Timeout waiting for torrent download to start");
  }

  /** Cross-container safe: raw .torrent bytes as base64 metainfo. */
  async addTorrentMetainfo(
    torrentBuffer: Buffer,
    options: TransmissionAddOptions = {}
  ): Promise<{ id: number }> {
    const args = await this.rpc<{
      "torrent-added"?: { id: number; name: string; hashString: string };
      "torrent-duplicate"?: { id: number };
    }>({
      method: "torrent-add",
      arguments: {
        metainfo: torrentBuffer.toString("base64"),
        ...options,
      },
    });
    const added = args["torrent-added"] ?? args["torrent-duplicate"];
    if (!added) {
      hypertubeLogger.error(
        `Transmission torrent-add failed: ${JSON.stringify(args)}`
      );
      throw new Error("Transmission add failed");
    }
    return { id: added.id };
  }

  async get(
    id: number,
    fields?: string[]
  ): Promise<{ torrents: TransmissionTorrent[] }> {
    const defaultFields = [
      "id",
      "name",
      "percentDone",
      "rateDownload",
      "status",
      "error",
      "errorString",
      "files",
    ];
    const args = await this.rpc<{ torrents: TransmissionTorrent[] }>({
      method: "torrent-get",
      arguments: {
        ids: [id],
        fields: fields ?? defaultFields,
      },
    });
    return args;
  }

  async start(id: number): Promise<void> {
    await this.rpc({
      method: "torrent-start",
      arguments: { ids: [id] },
    });
  }

  async remove(id: number, deleteLocalData = false): Promise<void> {
    await this.rpc({
      method: "torrent-remove",
      arguments: { ids: [id], "delete-local-data": deleteLocalData },
    });
  }
}

export const downloader = new TransmissionClient();
