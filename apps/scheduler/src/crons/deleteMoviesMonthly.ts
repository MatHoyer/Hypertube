import { formatUnknownError, newUTCDate, TLogger } from "@hypertube/libs";
import {
  BUCKETS,
  getMovieQueue,
  MOVIE_QUEUE_JOB_NAMES,
  prisma,
} from "@hypertube/server-core";
import { subMonths } from "date-fns";
import { cronUTC } from "../cronUTC.js";
import { storageService } from "../main.js";

const DELETE_MOVIES_MONTHLY_CRON_EXPRESSION = "0 0 0 * * *";
const DELETE_MOVIES_MONTHLY_CRON_NAME = "Delete movies monthly";

const DELETE_MOVIES_MONTHLY_CRON_CALLBACK = async (localLogger: TLogger) => {
  localLogger.info("Deleting movies older than 1 month");

  const moviesToDelete = await prisma.movie.findMany({
    where: {
      usedAt: {
        lt: subMonths(newUTCDate(), 1),
      },
    },
    include: { resolutions: true },
  });

  if (moviesToDelete.length === 0) {
    localLogger.warn("No movies to delete");
    return;
  }
  localLogger.info(`Deleting ${moviesToDelete.length} movies`);

  for (const movie of moviesToDelete) {
    try {
      await storageService.removeObjectsByPrefix(
        BUCKETS.MOVIES,
        movie.tmdbId.toString()
      );
    } catch (error) {
      localLogger.error(
        `Error deleting movie folder: ${formatUnknownError(error)}`
      );
    }

    // Stop seeding and purge raw torrent piece data. Deletes the S3 prefix
    // ourselves (this cron already has storageService) before telling any
    // live downloader to detach the in-memory torrent, so there's no window
    // where a downloader could re-verify pieces we're about to remove.
    for (const resolution of movie.resolutions) {
      if (!resolution.infoHash) continue;

      try {
        await storageService.removeObjectsByPrefix(
          BUCKETS.TORRENT_PIECES,
          resolution.infoHash
        );
      } catch (error) {
        localLogger.error(
          `Error deleting torrent piece store for ${resolution.infoHash}: ${formatUnknownError(error)}`
        );
      }

      try {
        await getMovieQueue().produce(MOVIE_QUEUE_JOB_NAMES.STOP_SEEDING, {
          infoHash: resolution.infoHash,
        });
      } catch (error) {
        localLogger.error(
          `Error enqueueing stop-seeding job for ${resolution.infoHash}: ${formatUnknownError(error)}`
        );
      }
    }
  }

  const deletedMovies = await prisma.movie.deleteMany({
    where: {
      id: {
        in: moviesToDelete.map((movie) => movie.id),
      },
    },
  });

  localLogger.info(`Deleted ${deletedMovies.count} movies`);
};

export const deleteMoviesMonthlyCron = () => {
  cronUTC({
    cronExpression: DELETE_MOVIES_MONTHLY_CRON_EXPRESSION,
    callback: DELETE_MOVIES_MONTHLY_CRON_CALLBACK,
    cronName: DELETE_MOVIES_MONTHLY_CRON_NAME,
  });
};
