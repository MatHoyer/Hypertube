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
import prisma from "../../lib/prisma.js";
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

  const dbMovies = await prisma.tmpMovie.createManyAndReturn({
    data: movies.map((movie) => ({
      title: movie.title,
      imageUrl: movie.image,
      link: movie.link,
    })),
    skipDuplicates: true,
  });

  return c.json(
    getYtsMoviesSchemas.response.parse({
      movies: dbMovies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        imageUrl: movie.imageUrl,
      })),
    })
  );
};

export const getYtsMovieData = async (
  c: Context<TSearchParamsParser<TGetYtsMovieDataSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  const { id } = c.get("validatedSearchParams");
  const tmpMovie = await prisma.tmpMovie.findUnique({
    where: {
      id,
    },
  });
  if (!tmpMovie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  ytsScrapper.setCurrentUrl(tmpMovie.link);
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
