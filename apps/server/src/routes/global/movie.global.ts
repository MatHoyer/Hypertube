import { DownloadStates, TTmdbMovieSchema } from "@hypertube/libs";
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
