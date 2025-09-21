import {
  getMovieSchemas,
  getMoviesSchemas,
  languageCodes,
  TGetMovieSchemas,
  TGetMoviesSchemas,
  tmdbMovieSchema,
} from "@hypertube/libs";
import { Context } from "hono";
import z from "zod";
import { env } from "../../env";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import prisma from "../../lib/prisma";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { scrapMovieData } from "./movie.helper";

export const getMovies = async (
  c: Context<TSearchParamsParser<TGetMoviesSchemas["searchParams"]>>
) => {
  const tmdbApi = new TmdbApi();

  const { name, page } = c.get("validatedSearchParams");
  const language = c.get("language");

  const moviesPagination = await tmdbApi.getMovies({
    query: name,
    language: language as keyof typeof languageCodes,
    page,
  });

  return c.json(getMoviesSchemas.response.parse(moviesPagination));
};

export const getMovie = async (
  c: Context<TUrlParamsParser<TGetMovieSchemas["urlParams"]>>
) => {
  const { movieId } = c.get("validatedUrlParams");
  const language = c.get("language");

  const tmdbApi = new TmdbApi();
  const tmdbMovie =
    movieId === 0
      ? ({
          id: 0,
          imdb_id: "tt0",
          original_title: "Demo Movie",
          original_language: "fr",
          title: "Demo Movie",
          overview: "This is a demo movie",
          genres: [{ id: 0, name: "Demo Genre" }],
          vote_average: 0,
          vote_count: 0,
          popularity: 0,
          poster_path: null,
          backdrop_path: null,
          release_date: "2025-01-01",
          adult: false,
        } as z.infer<typeof tmdbMovieSchema>)
      : await tmdbApi.getMovie(movieId, language as keyof typeof languageCodes);

  let dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId: movieId,
    },
  });
  if (!dbMovie) {
    dbMovie = await prisma.movie.create({
      data: {
        tmdbId: movieId,
        imdbId: tmdbMovie.imdb_id,
      },
    });
  }

  try {
    if (!env.VPN_IS_ACTIVE) throw new Error("VPN is not active");

    if (!dbMovie.additionalInfoFetched) {
      await scrapMovieData(dbMovie.id);
    } else {
      scrapMovieData(dbMovie.id);
    }
  } catch (error) {
    console.error("Error scraping movie data", error);
  }

  const resolutions = await prisma.resolution.findMany({
    where: {
      movieId: dbMovie.id,
    },
  });
  const subtitles = await prisma.subtitle.findMany({
    where: {
      movieId: dbMovie.id,
    },
  });

  return c.json(
    getMovieSchemas.response.parse({
      ...tmdbMovie,
      ...dbMovie,
      resolutions,
      subtitles,
    })
  );
};
