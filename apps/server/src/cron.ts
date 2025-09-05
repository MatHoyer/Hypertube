import { newUTCDate } from "@hypertube/libs";
import { subMonths } from "date-fns";
import cron from "node-cron";
import prisma from "../src/lib/prisma";
import { deleteMovieFolder } from "./lib/movie-folder-gestion/movie";

console.log("Cron jobs started");

cron.schedule("0 0 * * *", async () => {
  console.log("Deleting movies older than 1 month");

  try {
    const moviesToDelete = await prisma.movie.findMany({
      where: {
        usedAt: {
          lt: subMonths(newUTCDate(), 1),
        },
      },
    });

    if (moviesToDelete.length === 0) {
      console.log("No movies to delete");
      return;
    }
    console.log(`Deleting ${moviesToDelete.length} movies`);

    for (const movie of moviesToDelete) {
      try {
        await deleteMovieFolder(movie.id);
      } catch (error) {
        console.error("Error deleting movie folder", error);
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
    console.error("Error deleting movies", error);
  }
});
