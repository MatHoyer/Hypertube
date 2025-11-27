import {
  DownloadStates,
  getMovieSchemas,
  getMoviesSchemas,
  hypertubeLogger,
  languageCodes,
  ParentTypes,
  TDeleteMovieLikeSchemas,
  TDeleteMovieSubscribeSchemas,
  TGetMovieCommentsSchemas,
  TGetMovieSchemas,
  TGetMoviesSchemas,
  TGetMovieSSESchemas,
  tmdbGenres,
  tmdbMovieSchema,
  TPostMovieCommentSchemas,
  TPostMovieDownloadResolutionSchemas,
  TPostMovieDownloadSubtitlesSchemas,
  TPostMovieLikeSchemas,
  TPostMovieSubscribeSchemas,
  TResolutionSchema,
  typedKeys,
} from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import z from "zod";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { downloadTorrent } from "../../lib/downloader/downloadTorrent";
import { downloaderQueue } from "../../lib/queues/downloader";
import { downloadYifysubtitles } from "../../lib/scrappers/yifysubtitles.scrapper";
import { SSEClients } from "../../lib/SSEClients";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { commentParent, getParentComments } from "../global/comment.global";
import { likeParent, unlikeParent } from "../global/like.global";
import {
  getMovieData,
  sendSSEDownloadStateChange,
  sendSSEProgress,
} from "./movies.helper";

const tmdbGenresSchemas = z.array(z.enum(typedKeys(tmdbGenres)));

export const getMovies = async (
  c: Context<TSearchParamsParser<TGetMoviesSchemas["searchParams"]>>,
) => {
  const tmdbApi = new TmdbApi();

  const { query, page, category, sort, genres } = c.get(
    "validatedSearchParams",
  );
  const language = c.get("language");

  const genresTyped = tmdbGenresSchemas.safeParse(
    genres ? genres.split("+") : [],
  );
  if (!genresTyped.success) return c.json(genresTyped.error, 404);
  const genreIds = genresTyped.data.map((filter) => tmdbGenres[filter]);

  const moviesPagination = await tmdbApi.getMovies({
    query,
    language: language as keyof typeof languageCodes,
    page,
    category,
    sort,
    genres: genreIds,
  });

  const moviesWithResolutionsOrderByDownloadState = await prisma.movie.findMany(
    {
      where: {
        tmdbId: {
          in: moviesPagination.movies.filter(Boolean).map((movie) => movie!.id),
        },
      },
      include: {
        resolutions: {
          orderBy: {
            downloadState: "desc",
          },
        },
      },
    },
  );

  const resolutionStatusById = Object.fromEntries(
    moviesWithResolutionsOrderByDownloadState.map((movie) => [
      movie.tmdbId,
      movie.resolutions[0]?.downloadState,
    ]),
  );

  const moviesWithStatutPagination = {
    ...moviesPagination,
    movies: moviesPagination.movies.map((movie) => {
      if (!movie) return null;
      return {
        ...movie,
        status: resolutionStatusById[movie.id] ?? DownloadStates.NOT_DOWNLOADED,
      };
    }),
  };

  return c.json(getMoviesSchemas.response.parse(moviesWithStatutPagination));
};

export const getMovie = async (
  c: Context<TUrlParamsParser<TGetMovieSchemas["urlParams"]> & TIsLogged>,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const language = c.get("language");
  const user = c.get("user");

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

  if (!tmdbMovie) return c.json(null, 404);

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

  const likesNumber = await prisma.like.count({
    where: {
      parentId: dbMovie.id,
    },
  });

  let isLikedByUser = false;

  if (user.id) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_parentId: {
          userId: user.id,
          parentId: dbMovie.id,
        },
      },
    });
    isLikedByUser = !!existingLike;
  }

  try {
    if (dbMovie.demoMovie) throw new Error("Demo movie");
    if (!env.VPN_IS_ACTIVE) throw new Error("VPN is not active");

    if (!dbMovie.additionalInfoFetched) {
      await getMovieData(dbMovie);
    } else {
      void getMovieData(dbMovie);
    }
  } catch (error) {
    hypertubeLogger.error(`Error getting movie data: ${error}`);
  }

  const resolutions = await prisma.resolution.findMany({
    where: {
      movieId: dbMovie.id,
    },
    orderBy: {
      size: "asc",
    },
  });
  const subtitles = await prisma.subtitle.findMany({
    where: {
      movieId: dbMovie.id,
    },
    orderBy: {
      language: "asc",
    },
  });

  const subscription = await prisma.movieSubscription.findUnique({
    where: {
      movieId_userId: {
        movieId: dbMovie.id,
        userId: user.id,
      },
    },
  });
  const isSubscribed = !!subscription;

  return c.json(
    getMovieSchemas.response.parse({
      ...tmdbMovie,
      ...dbMovie,
      resolutions,
      subtitles,
      isSubscribed,
      likesNumber,
      isLikedByUser,
    }),
  );
};

const sseClients = new SSEClients();
downloaderQueue.on("completed", (job) => {
  sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
    sendSSEDownloadStateChange(job.data, DownloadStates.DOWNLOADED, stream);
  });
});
downloaderQueue.on("failed", (job) => {
  sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
    sendSSEDownloadStateChange(job.data, DownloadStates.NOT_DOWNLOADED, stream);
  });
});
downloaderQueue.on("waiting", (job) => {
  sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
    sendSSEDownloadStateChange(job.data, DownloadStates.WAITING, stream);
  });
});
downloaderQueue.on("progress", (job) => {
  sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
    sendSSEProgress(job, stream);
  });
});

export const getMovieSSE = async (
  c: Context<TUrlParamsParser<TGetMovieSSESchemas["urlParams"]>>,
) => {
  const { tmdbId } = c.get("validatedUrlParams");

  hypertubeLogger.info(`[${tmdbId}] SSE started`);

  return streamSSE(c, async (stream) => {
    sseClients.addClient(tmdbId.toString(), stream);

    stream.onAbort(() => {
      hypertubeLogger.info(`[${tmdbId}] SSE aborted`);
      sseClients.removeClient(tmdbId.toString(), stream);
    });

    while (true) {
      await stream.sleep(60000);
    }
  });
};

export const downloadMovie = async (
  c: Context<
    TUrlParamsParser<TPostMovieDownloadResolutionSchemas["urlParams"]>
  >,
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

  if (dbResolution.downloadState !== DownloadStates.NOT_DOWNLOADED) {
    return c.json(
      { message: "Resolution already downloaded or in downloading queue" },
      400,
    );
  }

  await prisma.resolution.update({
    where: {
      id: dbResolution.id,
    },
    data: {
      downloadState: DownloadStates.WAITING,
    },
  });
  try {
    await downloadTorrent({
      movie: dbMovie,
      resolution: dbResolution as TResolutionSchema,
    });
  } catch (error) {
    await prisma.resolution.update({
      where: {
        id: dbResolution.id,
      },
      data: {
        downloadState: DownloadStates.NOT_DOWNLOADED,
      },
    });
    hypertubeLogger.error(`Error downloading movie ${JSON.stringify(error)}`);
  }

  return c.json({ message: "Movie downloaded started" });
};

export const downloadSubtitles = async (
  c: Context<TUrlParamsParser<TPostMovieDownloadSubtitlesSchemas["urlParams"]>>,
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

  await prisma.subtitle.update({
    where: {
      id: dbMovie.subtitles[0].id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADING,
    },
  });

  try {
    await downloadYifysubtitles({
      ...dbMovie.subtitles[0],
      tmdbId: dbMovie.tmdbId,
    });
  } catch {
    await prisma.subtitle.update({
      where: {
        id: dbMovie.subtitles[0].id,
      },
      data: {
        downloadState: DownloadStates.NOT_DOWNLOADED,
      },
    });
    throw new Error("Error downloading subtitles");
  }

  await prisma.subtitle.update({
    where: {
      id: dbMovie.subtitles[0].id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADED,
    },
  });

  return c.json({ message: "Subtitles downloaded" });
};

export const subscribeToMovie = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TPostMovieSubscribeSchemas["urlParams"]>
  >,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { id: userId } = c.get("user");

  const dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
  });
  if (!dbMovie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await prisma.movieSubscription.create({
    data: {
      movieId: dbMovie.id,
      userId,
    },
  });

  return c.json({ message: "Movie subscribed" });
};

export const unsubscribeFromMovie = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieSubscribeSchemas["urlParams"]>
  >,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { id: userId } = c.get("user");

  const dbMovie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
  });
  if (!dbMovie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await prisma.movieSubscription.delete({
    where: {
      movieId_userId: {
        movieId: dbMovie.id,
        userId,
      },
    },
  });

  return c.json({ message: "Movie unsubscribed" });
};

export const likeMovie = async (
  c: Context<TIsLogged & TUrlParamsParser<TPostMovieLikeSchemas["urlParams"]>>,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
    select: { id: true },
  });

  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await likeParent(id, movie.id, ParentTypes.MOVIE);
  return c.json({ message: result.message }, result.status);
};

export const deleteMovieLike = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieLikeSchemas["urlParams"]>
  >,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });

  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await unlikeParent(id, movie.id);
  return c.json({ message: result.message }, result.status);
};

export const getMovieComments = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TGetMovieCommentsSchemas["urlParams"]> &
      TSearchParamsParser<TGetMovieCommentsSchemas["searchParams"]>
  >,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { page, pageSize } = c.get("validatedSearchParams");
  const user = c.get("user");
  const userId = user?.id;

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await getParentComments(
    movie.id,
    ParentTypes.MOVIE,
    userId,
    page,
    pageSize,
  );

  if (result.data) {
    return c.json(result.data);
  }
  return c.json({ message: result.message }, result.status);
};

export const commentMovie = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPostMovieCommentSchemas["urlParams"]> &
      TBodyParser<TPostMovieCommentSchemas["requirements"]>
  >,
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { content } = c.get("validatedBody");
  const { id } = c.get("user");

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await commentParent(content, id, movie.id, ParentTypes.MOVIE);
  return c.json({ message: result.message }, result.status);
};
