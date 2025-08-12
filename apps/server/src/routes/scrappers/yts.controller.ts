import type {
  TGetYtsDownloadMovieSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsPaginationSchemas,
} from "@hypertube/libs";
import { getYtsMovieDataSchemas } from "@hypertube/libs";
import {
  getYtsPaginationSchemas,
  type TGetYtsMoviesSchemas,
} from "@hypertube/libs/src/schemas/api/scrapper.schema.js";
import type { Context } from "hono";
import {
  getMovieByLongTitle,
  getResolutionsForMovie,
} from "../../lib/apis/yts.api.js";
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

  const movieData = (
    await Promise.all(
      movies.map(
        async (movie) => await getMovieByLongTitle(movie.title, movie.year)
      )
    )
  ).filter((movie) => movie !== null);

  const dbMovies = await Promise.all(
    movieData.map(
      async (movie) =>
        await prisma.movie.upsert({
          where: {
            imdbId: movie.imdb_code,
          },
          update: {
            title: movie.title_english,
            year: movie.year,
            rating: movie.rating,
            genres: movie.genres,
            language: movie.language,
            backgroundImageUrl: movie.background_image,
            smallCoverImageUrl: movie.small_cover_image,
            mediumCoverImageUrl: movie.medium_cover_image,
            largeCoverImageUrl: movie.large_cover_image,
            ytTrailerCode: movie.yt_trailer_code,
          },
          create: {
            imdbId: movie.imdb_code,
            title: movie.title_english,
            year: movie.year,
            rating: movie.rating,
            genres: movie.genres,
            language: movie.language,
            backgroundImageUrl: movie.background_image,
            smallCoverImageUrl: movie.small_cover_image,
            mediumCoverImageUrl: movie.medium_cover_image,
            largeCoverImageUrl: movie.large_cover_image,
            ytTrailerCode: movie.yt_trailer_code,
          },
        })
    )
  );

  return c.json(dbMovies);
};

export const getYtsMovieData = async (
  c: Context<TUrlParamsParser<TGetYtsMovieDataSchemas["urlParams"]>>
) => {
  const { id } = c.get("validatedUrlParams");
  const movie = await prisma.movie.findUnique({
    where: {
      id,
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  const resolutions = await getResolutionsForMovie(movie.imdbId);

  const subtitlesData = await getSubtitlesDownloadLinks({
    imdbId: movie.imdbId,
  });

  const subtitles = await Promise.all(
    subtitlesData.map(
      async (subtitle) =>
        await prisma.subtitle.upsert({
          where: { downloadLink: subtitle.link },
          update: {
            language: subtitle.language,
            rating: subtitle.rating,
          },
          create: {
            downloadLink: subtitle.link,
            language: subtitle.language,
            rating: subtitle.rating,
          },
        })
    )
  );

  return c.json(
    getYtsMovieDataSchemas.response.parse({
      resolutions: resolutions.map((resolution) => ({
        resolution: resolution.quality,
        size: resolution.size,
      })),
      subtitles: subtitles.map((subtitle) => ({
        language: subtitle.language,
        rating: subtitle.rating,
      })),
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
  const { movieId, resolution, subtitles } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      resolutions: {
        where: {
          resolution,
        },
      },
      subtitles: {
        where: {
          language: subtitles,
        },
      },
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  const ytsScrapper = new YtsScrapper();
  await ytsScrapper.downloadResolution(movieId, resolution);
  if (subtitles !== "none") {
    await downloadSubtitles(movie.subtitles[0].id);
  }

  return c.json({ message: "Movie downloaded" });
};
