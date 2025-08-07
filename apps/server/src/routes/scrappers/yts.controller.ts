import type {
  TGetYtsMovieDataSchemas,
  TGetYtsPaginationSchemas,
} from "@hypertube/libs";
import { getYtsMovieDataSchemas } from "@hypertube/libs";
import {
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
  type TGetYtsMoviesSchemas,
} from "@hypertube/libs/src/schemas/api/scrapper.schema.js";
import type { Context } from "hono";
import { YtsScrapper } from "../../lib/scrappers/yts.scrapper.js";
import type { TSearchParamsParser } from "../../middlewares/searchParamsParser.js";

export const getYtsFilters = async (c: Context) => {
  const ytsScrapper = new YtsScrapper();
  const searchParamsOptions = await ytsScrapper.filterScrape();

  return c.json(searchParamsOptions);
};

export const getYtsMovies = async (
  c: Context<TSearchParamsParser<TGetYtsMoviesSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedSearchParams");
  const movies = await ytsScrapper.defaultScrape();

  return c.json(getYtsMoviesSchemas.response.parse({ movies }));
};

export const getYtsMovieData = async (
  c: Context<TSearchParamsParser<TGetYtsMovieDataSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.setCurrentUrl(c.get("validatedSearchParams").link);
  const movieData = await ytsScrapper.movieDataScrape();

  return c.json(getYtsMovieDataSchemas.response.parse(movieData));
};

export const getYtsPagination = async (
  c: Context<TSearchParamsParser<TGetYtsPaginationSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedSearchParams");
  const maxPagination = await ytsScrapper.paginationScrape();

  return c.json(getYtsPaginationSchemas.response.parse({ maxPagination }));
};
