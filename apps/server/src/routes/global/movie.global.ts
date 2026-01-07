import { DownloadStates, TTmdbMovieSchema, TUserSchema } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";

export const getMovieDownloadStatesByTmdbIds = async (
  tmdbIds: TTmdbMovieSchema["id"][]
) => {
  const moviesWithResolutionsOrderByDownloadState = await prisma.movie.findMany(
    {
      where: {
        tmdbId: {
          in: tmdbIds,
        },
      },
      include: {
        resolutions: {
          orderBy: {
            downloadState: "desc",
          },
        },
      },
    }
  );

  return new Map(
    moviesWithResolutionsOrderByDownloadState.map((movie) => [
      movie.tmdbId,
      movie.resolutions[0]?.downloadState ?? DownloadStates.NOT_DOWNLOADED,
    ])
  );
};

export const getMovieSeensByTmdbIds = async (
  tmdbIds: TTmdbMovieSchema["id"][],
  userId: TUserSchema["id"]
) => {
  const movies = await prisma.movie.findMany({
    where: {
      tmdbId: {
        in: tmdbIds,
      },
    },
  });
  const moviesWithDurationAndTimestamp = await prisma.movieHistory.findMany({
    where: { movieId: { in: movies.map((movie) => movie.id) }, userId },
    include: { movie: { select: { tmdbId: true } } },
  });

  return new Map(
    moviesWithDurationAndTimestamp.map((movie) => [
      movie.movie.tmdbId,
      (movie.timestamp / movie.duration) * 100 > 90,
    ])
  );
};
