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
import { createMovie } from "../../lib/movie-folder-gestion/movie.js";
import { createResolution } from "../../lib/movie-folder-gestion/resolution.js";
import { createSubtitle } from "../../lib/movie-folder-gestion/subtitle.js";
import prisma from "../../lib/prisma.js";
import { getSubtitlesDownloadLinks } from "../../lib/scrappers/yifysubtitles.scrapper.js";
import { YtsScrapper } from "../../lib/scrappers/yts.scrapper.js";
import type { TSearchParamsParser } from "../../middlewares/searchParamsParser.js";
import type { TUrlParamsParser } from "../../middlewares/urlParamsParser.js";

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

  const dbMovies = await Promise.all(
    movies.map(
      async (movie) =>
        await prisma.movie.upsert({
          where: {
            link: movie.link,
          },
          update: movie,
          create: movie,
        })
    )
  );

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
  c: Context<TUrlParamsParser<TGetYtsMovieDataSchemas["urlParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  const { id } = c.get("validatedUrlParams");
  const movie = await prisma.movie.findUnique({
    where: {
      id,
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  ytsScrapper.setCurrentUrl(movie.link);
  const movieData = await ytsScrapper.movieDataScrape();
  if (!movieData) {
    return c.json({ error: "Movie data not found" }, 404);
  }

  await createMovie({
    title: movie.title,
    imageUrl: movie.imageUrl,
    link: movie.link,
  });

  const resolutions = await Promise.all(
    movieData.resolutions.map(
      async (resolution) =>
        await createResolution({
          Movie: {
            connect: {
              id: movie.id,
            },
          },
          resolution: resolution.resolution,
          size: resolution.size,
          link: resolution.link,
        })
    )
  );

  const subtitlesDownloadLinks = await getSubtitlesDownloadLinks({
    endpoint: movieData.subtitlesLink,
    isCompleteUrl: true,
  });

  const subtitles = await Promise.all(
    subtitlesDownloadLinks.map(
      async (subtitle) =>
        await createSubtitle({
          Movie: {
            connect: {
              id: movie.id,
            },
          },
          language: subtitle.language,
          rating: subtitle.rating,
          link: subtitle.link,
        })
    )
  );

  return c.json(
    getYtsMovieDataSchemas.response.parse({
      resolutions: resolutions.map((resolution) => ({
        resolution: resolution.resolution,
        size: resolution.size,
        link: resolution.link,
      })),
      subtitles: subtitles.map((subtitle) => ({
        language: subtitle.language,
        rating: subtitle.rating,
        link: subtitle.link,
      })),
    })
  );
};

export const getYtsPagination = async (
  c: Context<TSearchParamsParser<TGetYtsPaginationSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedSearchParams");
  const maxPagination = await ytsScrapper.paginationScrape();

  return c.json(getYtsPaginationSchemas.response.parse({ maxPagination }));
};
