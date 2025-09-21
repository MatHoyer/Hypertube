import {
  getMovieSchemas,
  getMoviesSchemas,
  TGetMovieSchemas,
  TGetMoviesSchemas,
} from "@hypertube/libs";
import { Context } from "hono";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getMovies = async (
  c: Context<TSearchParamsParser<TGetMoviesSchemas["searchParams"]>>
) => {
  const tmdbApi = new TmdbApi();

  const { name, language, page } = c.get("validatedSearchParams");
  const moviesPagination = await tmdbApi.getMovies({
    query: name,
    language,
    page,
  });

  console.log(moviesPagination);

  return c.json(getMoviesSchemas.response.parse(moviesPagination));
};

export const getMovie = async (
  c: Context<TUrlParamsParser<TGetMovieSchemas["urlParams"]>>
) => {
  const tmdbApi = new TmdbApi();

  const { movieId } = c.get("validatedUrlParams");
  const movie = await tmdbApi.getMovie(movieId);

  return c.json(getMovieSchemas.response.parse(movie));
};
