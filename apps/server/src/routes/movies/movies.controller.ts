import {
  DownloadStates,
  getMovieSchemas,
  getMoviesSchemas,
  languageCodes,
  TGetMovieSchemas,
  TGetMoviesSchemas,
  tmdbMovieSchema,
  TPostMovieDownloadResolutionSchemas,
  TPostMovieDownloadSubtitlesSchemas,
} from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import z from "zod";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { downloadTorrent } from "../../lib/downloader/downloadTorrent";
import { downloadYifysubtitles } from "../../lib/scrappers/yifysubtitles.scrapper";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { getMovieData } from "./movies.helper";

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
  const { tmdbId } = c.get("validatedUrlParams");
  const language = c.get("language");

  const tmdbApi = new TmdbApi();
  const tmdbMovie =
    tmdbId === 0
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
      : await tmdbApi.getMovie(tmdbId, language as keyof typeof languageCodes);

  let dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
  });
  if (!dbMovie) {
    dbMovie = await prisma.movie.create({
      data: {
        tmdbId,
        imdbId: tmdbMovie.imdb_id,
      },
    });
  }

  try {
    if (dbMovie.demoMovie) throw new Error("Demo movie");
    if (!env.VPN_IS_ACTIVE) throw new Error("VPN is not active");
    console.log(env.VPN_IS_ACTIVE);

    if (!dbMovie.additionalInfoFetched) {
      await getMovieData(dbMovie);
    } else {
      getMovieData(dbMovie);
    }
  } catch (error) {
    console.error("Error getting movie data", error);
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

export const downloadMovie = async (
  c: Context<TUrlParamsParser<TPostMovieDownloadResolutionSchemas["urlParams"]>>
) => {
  const { tmdbId, resolution } = c.get("validatedUrlParams");

  const dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
    include: {
      resolutions: {
        where: {
          resolution,
        },
      },
    },
  });
  if (!dbMovie) {
    return c.json({ message: "Movie not found" }, 404);
  }
  const dbResolution = dbMovie.resolutions[0];
  if (!dbResolution) {
    return c.json({ message: "Resolution not found" }, 404);
  }
  if (
    dbResolution.downloadState === DownloadStates.DOWNLOADING ||
    dbResolution.downloadState === DownloadStates.DOWNLOADED
  ) {
    return c.json(
      { message: "Resolution already downloading or downloaded" },
      400
    );
  }

  await prisma.resolution.update({
    where: {
      id: dbResolution.id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADING,
    },
  });
  try {
    await downloadTorrent({
      movie: dbMovie,
      resolution: dbResolution,
    });
  } catch {
    await prisma.resolution.update({
      where: {
        id: dbResolution.id,
      },
      data: {
        downloadState: DownloadStates.NOT_DOWNLOADED,
      },
    });
  }

  return c.json({ message: "Movie downloaded started" });
};

export const downloadSubtitles = async (
  c: Context<TUrlParamsParser<TPostMovieDownloadSubtitlesSchemas["urlParams"]>>
) => {
  const { tmdbId, subtitlesLanguage } = c.get("validatedUrlParams");

  const dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
    include: {
      subtitles: {
        where: {
          language: subtitlesLanguage,
        },
      },
    },
  });
  if (!dbMovie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await downloadYifysubtitles({
    ...dbMovie.subtitles[0],
    tmdbId: dbMovie.tmdbId,
  });

  return c.json({ message: "Subtitles downloaded started" });
};
