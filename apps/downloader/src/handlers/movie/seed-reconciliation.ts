import {
  DownloadStates,
  formatUnknownError,
  hypertubeLogger,
  newUTCDate,
} from "@hypertube/libs";
import { BUCKETS, getStoragePath, prisma } from "@hypertube/server-core";
import { subMonths } from "date-fns";
import { buffer } from "node:stream/consumers";
import { storageService } from "../../main.js";
import { addTorrent, registerSeed } from "./webtorrent.client.js";

/**
 * Every downloader process is disposable, but seeding shouldn't stop just
 * because the worker that did the original download restarted or was
 * replaced. On boot, re-attach every resolution that's still fully
 * downloaded and still within the monthly retention window that
 * apps/scheduler/src/crons/deleteMoviesMonthly.ts enforces — anything it
 * would delete is, by construction, also not worth re-seeding here.
 */
export const reconcileSeeds = async (): Promise<void> => {
  const retentionCutoff = subMonths(newUTCDate(), 1);

  const resolutions = await prisma.resolution.findMany({
    where: {
      downloadState: DownloadStates.DOWNLOADED,
      infoHash: { not: null },
      Movie: { usedAt: { gte: retentionCutoff } },
    },
    include: { Movie: true },
  });

  if (resolutions.length === 0) {
    hypertubeLogger.info("Seed reconciliation: nothing to resume");
    return;
  }

  hypertubeLogger.info(
    `Seed reconciliation: resuming ${resolutions.length} torrent(s)`
  );

  await Promise.allSettled(
    resolutions.map(async (resolution) => {
      if (!resolution.infoHash) return;
      try {
        const torrentStream = await storageService.getObject(
          BUCKETS.MOVIES,
          getStoragePath(
            resolution.Movie.tmdbId.toString(),
            "resolutions",
            resolution.id,
            "resolution.torrent"
          )
        );
        const torrentBuf = await buffer(torrentStream);
        const isMagnet = torrentBuf.toString("utf-8").startsWith("magnet:");
        const torrentId: string | Buffer = isMagnet
          ? torrentBuf.toString("utf-8")
          : torrentBuf;

        const torrent = addTorrent(torrentId, {
          infoHash: resolution.infoHash as string,
          storageService,
        });
        registerSeed(torrent);
      } catch (error) {
        hypertubeLogger.error(
          `Seed reconciliation failed for resolution ${resolution.id}: ${formatUnknownError(error)}`
        );
      }
    })
  );
};
