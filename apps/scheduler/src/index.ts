import {
  deleteMovieFolder,
  hypertubeLogger,
  newUTCDate,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { subMonths } from "date-fns";
import cron from "node-cron";

hypertubeLogger.info("Cron jobs started");

cron.schedule("0 */1 * * * *", async () => {
  hypertubeLogger.info("Scheduler healthcheck");
});

cron.schedule("0 0 0 * * *", async () => {
  hypertubeLogger.info("Deleting movies older than 1 month");

  try {
    const moviesToDelete = await prisma.movie.findMany({
      where: {
        usedAt: {
          lt: subMonths(newUTCDate(), 1),
        },
      },
    });

    if (moviesToDelete.length === 0) {
      hypertubeLogger.info("No movies to delete");
      return;
    }
    hypertubeLogger.info(`Deleting ${moviesToDelete.length} movies`);

    for (const movie of moviesToDelete) {
      try {
        await deleteMovieFolder(movie.tmdbId);
      } catch (error) {
        hypertubeLogger.error(`Error deleting movie folder: ${error}`);
      }
    }

    await prisma.movie.deleteMany({
      where: {
        id: {
          in: moviesToDelete.map((movie) => movie.id),
        },
      },
    });
  } catch (error) {
    hypertubeLogger.error(`Error deleting movies: ${error}`);
  }
});
