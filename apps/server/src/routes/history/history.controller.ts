import {
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

export const getHistory = async (
  c: Context<
    TIsLogged & TSearchParamsParser<TGetHistorySchemas["searchParams"]>
  >,
) => {
  const { id: userId } = c.get("user");
  const language = c.get("language");
  const { page, pageSize } = c.get("validatedSearchParams");

  const history = await prisma.movieHistory.findMany({
    where: { userId },
    include: {
      movie: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const tmdbApi = new TmdbApi();
  const tmdbMovies = await tmdbApi.getAllMovieDetails(
    history.map((history) => history.movie.tmdbId),
    language as keyof typeof languageCodes,
  );

  return c.json(getHistorySchemas.response.parse({ movies: tmdbMovies }), 200);
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
  >,
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
