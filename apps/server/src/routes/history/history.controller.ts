import {
  DownloadStates,
  getHistorySchemas,
  languageCodes,
  TDeleteMovieFromHistorySchemas,
  TGetHistorySchemas,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { getMovieDownloadStatesByTmdbIds } from "../global/movie.global";

export const getHistory = async (
  c: Context<
    TIsLogged & TSearchParamsParser<TGetHistorySchemas["searchParams"]>
  >
) => {
  const { id: userId } = c.get("user");
  const language = c.get("language");
  const { page, pageSize } = c.get("validatedSearchParams");

  const history = await prisma.movieHistory.findMany({
    where: { userId },
    include: {
      movie: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await prisma.movieHistory.count({ where: { userId } });

  const movieDownloadStatesByTmdbIds = await getMovieDownloadStatesByTmdbIds(
    history.map((history) => history.movie.tmdbId)
  );
  const watchTimersByMovieId = new Map(
    history.map((history) => [history.movie.tmdbId, history.timestamp])
  );

  const tmdbApi = new TmdbApi();
  const tmdbMovies = (
    await tmdbApi.getAllMovieDetails(
      history.map((history) => history.movie.tmdbId),
      language as keyof typeof languageCodes
    )
  ).filter(Boolean);

  return c.json(
    getHistorySchemas.response.parse({
      movies: tmdbMovies.map((tmdbMovie) => ({
        details: tmdbMovie,
        downloadState:
          movieDownloadStatesByTmdbIds.get(tmdbMovie!.id) ??
          DownloadStates.NOT_DOWNLOADED,
        watchTimer: watchTimersByMovieId.get(tmdbMovie!.id) ?? 0,
      })),
      totalCount,
    }),
    200
  );
};

export const deleteHistory = async (c: Context<TIsLogged>) => {
  const { id: userId } = c.get("user");

  await prisma.movieHistory.deleteMany({
    where: { userId },
  });

  return c.json({ message: "History deleted" }, 200);
};

export const deleteMovieFromHistory = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieFromHistorySchemas["urlParams"]>
  >
) => {
  const { id } = c.get("user");
  const { tmdbId } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await prisma.movieHistory.delete({
    where: { movieId_userId: { movieId: movie.id, userId: id } },
  });

  return c.json({ message: "Movie deleted from history" }, 200);
};
