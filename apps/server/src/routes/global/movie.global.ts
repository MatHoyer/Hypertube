import {
  DownloadState,
  DownloadStates,
  TTmdbMovieSchema,
  TUserSchema,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";

const DOWNLOAD_STATE_PRIORITY: Record<DownloadState, number> = {
  [DownloadStates.DOWNLOADED]: 4,
  [DownloadStates.DOWNLOADING]: 3,
  [DownloadStates.WAITING]: 2,
  [DownloadStates.NOT_DOWNLOADED]: 1,
};

const aggregateDownloadState = (
  resolutions: { downloadState: DownloadState }[]
): DownloadState => {
  if (!resolutions.length) return DownloadStates.NOT_DOWNLOADED;

  return resolutions.reduce<DownloadState>(
    (best, resolution) =>
      DOWNLOAD_STATE_PRIORITY[resolution.downloadState] >
      DOWNLOAD_STATE_PRIORITY[best]
        ? resolution.downloadState
        : best,
    DownloadStates.NOT_DOWNLOADED
  );
};

export const getMovieDownloadStatesByTmdbIds = async (
  tmdbIds: TTmdbMovieSchema["id"][]
) => {
  const moviesWithResolutions = await prisma.movie.findMany({
    where: {
      tmdbId: {
        in: tmdbIds,
      },
    },
    include: {
      resolutions: true,
    },
  });

  return new Map(
    moviesWithResolutions.map((movie) => [
      movie.tmdbId,
      aggregateDownloadState(movie.resolutions),
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
