import {
  DownloadState,
  DownloadStates,
  notifications,
  TMovieSchema,
} from "@hypertube/libs";
import { generateNotification, prisma } from "@hypertube/server-core";

export const notifySubscribers = async (
  movieId: TMovieSchema["id"],
  movieState: DownloadState
) => {
  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });
  if (!movie) {
    throw new Error("Movie not found");
  }

  const subscribers = await prisma.movieSubscription.findMany({
    where: {
      movieId,
    },
  });

  await generateNotification(
    subscribers.map((subscriber) => subscriber.userId),
    movieState === DownloadStates.DOWNLOADED
      ? notifications.MOVIE_DOWNLOADED
      : notifications.MOVIE_DOWNLOADING,
    {
      tmdbId: movie.tmdbId,
    }
  );
};
