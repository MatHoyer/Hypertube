import type {
  TGetYtsDownloadMovieSchemas,
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
import {
  downloadSubtitles,
  getSubtitlesDownloadLinks,
} from "../../lib/scrappers/yifysubtitles.scrapper.js";
import { YtsScrapper } from "../../lib/scrappers/yts.scrapper.js";
import type { TSearchParamsParser } from "../../middlewares/searchParamsParser.js";
import type { TUrlParamsParser } from "../../middlewares/urlParamsParser.js";

export const getYtsFilters = async (c: Context) => {
  const ytsScrapper = new YtsScrapper();
  const filters = await ytsScrapper.filterScrape();

  return c.json(filters);
};

export const getYtsMovies = async (
  c: Context<TSearchParamsParser<TGetYtsMoviesSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  const { page, ...rest } = c.get("validatedSearchParams");
  ytsScrapper.currentSearchParams = { page: page };
  ytsScrapper.updateUrlParams(rest);
  ytsScrapper.createUrl();
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
      movies: dbMovies,
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
          link: resolution.link,
        })
    )
  );

  let subtitles: { link: string; language: string; rating: number }[] = [];
  if (movieData.subtitlesLink) {
    const subtitlesDownloadLinks = await getSubtitlesDownloadLinks({
      endpoint: movieData.subtitlesLink,
      isCompleteUrl: true,
    });

    subtitles = await Promise.all(
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
  }

  return c.json(
    getYtsMovieDataSchemas.response.parse({
      resolutions,
      subtitles,
    })
  );
};

export const getYtsPagination = async (
  c: Context<TSearchParamsParser<TGetYtsPaginationSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  const { page, ...rest } = c.get("validatedSearchParams");
  ytsScrapper.currentSearchParams = { page: page };
  ytsScrapper.updateUrlParams(rest);
  ytsScrapper.createUrl();
  const maxPagination = await ytsScrapper.paginationScrape();

  return c.json(getYtsPaginationSchemas.response.parse({ maxPagination }));
};

export const getYtsDownloadMovie = async (
  c: Context<TUrlParamsParser<TGetYtsDownloadMovieSchemas["urlParams"]>>
) => {
  const { movieId, resolutionId, subtitlesId } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      resolutions: {
        where: {
          id: resolutionId,
        },
      },
      subtitles: {
        where: {
          id: subtitlesId === "none" ? undefined : subtitlesId,
        },
      },
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  const ytsScrapper = new YtsScrapper();
  await ytsScrapper.downloadResolution(resolutionId);
  if (subtitlesId !== "none") {
    await downloadSubtitles(subtitlesId);
  }

  return c.json({ message: "Movie downloaded" });
};
