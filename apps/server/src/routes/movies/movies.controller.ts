import {
  DownloadStates,
  getMovieCastingSchema,
  getMovieCommentSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  hypertubeLogger,
  languageCodes,
  ParentTypes,
  Providers,
  TDeleteMovieLikeSchemas,
  TDeleteMovieSubscribeSchemas,
  TGetMovieCastingSchema,
  TGetMovieCommentsSchemas,
  TGetMovieResolutionsSchemas,
  TGetMovieSchemas,
  TGetMoviesSchemas,
  TGetMovieSSESchemas,
  TGetMovieSubtitlesSchemas,
  tmdbGenres,
  TPostMovieCommentSchemas,
  TPostMovieDownloadResolutionSchemas,
  TPostMovieDownloadSubtitlesSchemas,
  TPostMovieLikeSchemas,
  TPostMovieSubscribeSchemas,
  TPutMovieWatchTimerSchemas,
  TResolutionSchema,
  typedKeys,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import i18next from "i18next";
import z from "zod";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { YtsProxyApi } from "../../lib/apis/yts-proxy.api";
import { downloadTorrent } from "../../lib/downloader/downloadTorrent";
import { downloaderQueue } from "../../lib/queues/downloader";
import { SSEClients } from "../../lib/SSEClients";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { commentParent, getParentComments } from "../global/comment.global";
import { likeParent, unlikeParent } from "../global/like.global";
import {
  getMovieDownloadStatesByTmdbIds,
  getMovieSeensByTmdbIds,
} from "../global/movie.global";
import { sendSSEDownloadStateChange, sendSSEProgress } from "./movies.helper";

const tmdbGenresSchemas = z.array(z.enum(typedKeys(tmdbGenres)));

export const getMovies = async (
  c: Context<TIsLogged & TSearchParamsParser<TGetMoviesSchemas["searchParams"]>>
) => {
  const tmdbApi = new TmdbApi();

  const { query, page, category, sort, genres } = c.get(
    "validatedSearchParams"
  );
  const user = c.get("user");
  const language = c.get("language");

  const genresTyped = tmdbGenresSchemas.safeParse(
    genres ? genres.split(",") : []
  );
  if (!genresTyped.success) return c.json(genresTyped.error, 400);
  const genreIds = genresTyped.data.map((filter) => tmdbGenres[filter]);

  const moviesPagination = await tmdbApi.getMovies({
    query,
    language: language as keyof typeof languageCodes,
    page,
    category,
    sort,
    genres: genreIds,
  });

  const movieDownloadStatesByTmdbIds = await getMovieDownloadStatesByTmdbIds(
    moviesPagination.movies.map((movie) => movie.id)
  );

  const movieSeensByTmdbIds = await getMovieSeensByTmdbIds(
    moviesPagination.movies.map((movie) => movie.id),
    user.id
  );

  const moviesWithStatutPagination = {
    ...moviesPagination,
    movies: moviesPagination.movies.map((movie) => {
      return {
        details: movie,
        downloadState:
          movieDownloadStatesByTmdbIds.get(movie.id) ??
          DownloadStates.NOT_DOWNLOADED,
        isSeen: movieSeensByTmdbIds.get(movie.id) ?? false,
      };
    }),
  };

  return c.json(
    getMoviesSchemas.response.parse(moviesWithStatutPagination),
    200
  );
};

export const getMovie = async (
  c: Context<TIsLogged & TUrlParamsParser<TGetMovieSchemas["urlParams"]>>
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const language = c.get("language");
  const user = c.get("user");

  const tmdbApi = new TmdbApi();
  const tmdbMovie =
    tmdbId === 0
      ? {
          id: 0,
          imdb_id: null,
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
          hasDetails: true as const,
        }
      : await tmdbApi.getMovie(tmdbId, language as keyof typeof languageCodes);

  if (!tmdbMovie.hasDetails) return c.json(null, 404);

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

  const subscription = await prisma.movieSubscription.findUnique({
    where: {
      movieId_userId: {
        movieId: dbMovie.id,
        userId: user.id,
      },
    },
  });
  const isSubscribed = !!subscription;

  const watchTimer = await prisma.movieHistory.findUnique({
    where: {
      movieId_userId: {
        movieId: dbMovie.id,
        userId: user.id,
      },
    },
  });
  const watchedTimestamp = watchTimer ? watchTimer.timestamp : 0;

  return c.json(
    getMovieSchemas.response.parse({
      details: tmdbMovie,
      id: dbMovie.id,
      isSubscribed,
      likesNumber,
      isLikedByUser,
      watchedTimestamp,
    }),
    200
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
  c: Context<TUrlParamsParser<TGetMovieSSESchemas["urlParams"]>>
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

export const getMovieResolutions = async (
  c: Context<TUrlParamsParser<TGetMovieResolutionsSchemas["urlParams"]>>
) => {
  const { tmdbId } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });
  if (!movie) return c.json({ message: "Movie not found" }, 404);
  if (!movie.imdbId) return c.json({ resolutions: [] }, 200);

  const ytsProxyApi = new YtsProxyApi();

  const resolutions = await ytsProxyApi.getResolutions(movie.imdbId);
  if (resolutions) {
    await prisma.resolution.createMany({
      data: resolutions.map((resolution) => ({
        movieId: movie.id,
        resolution: resolution.quality,
        size: resolution.size,
        provider: Providers.YTS,
      })),
      skipDuplicates: true,
    });
  }

  const dbResolutions = await prisma.resolution.findMany({
    where: {
      movieId: movie.id,
    },
    orderBy: {
      size: "asc",
    },
  });
  return c.json({ resolutions: dbResolutions }, 200);
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

  if (dbResolution.downloadState !== DownloadStates.NOT_DOWNLOADED) {
    return c.json(
      { message: "Resolution already downloaded or in downloading queue" },
      400
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

  return c.json({ message: "Movie downloaded started" }, 200);
};

export const getMovieSubtitles = async (
  c: Context<TUrlParamsParser<TGetMovieSubtitlesSchemas["urlParams"]>>
) => {
  const { tmdbId } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });
  if (!movie) return c.json({ message: "Movie not found" }, 404);
  if (!movie.imdbId) return c.json({ subtitles: [] }, 200);

  const ytsProxyApi = new YtsProxyApi();

  const subtitles = await ytsProxyApi.getSubtitles(movie.imdbId);
  if (subtitles) {
    await prisma.subtitle.createMany({
      data: subtitles.map((subtitle) => ({
        movieId: movie.id,
        language: subtitle.language,
        rating: subtitle.rating,
        downloadLink: subtitle.link,
      })),
      skipDuplicates: true,
    });
  }

  const dbSubtitles = await prisma.subtitle.findMany({
    where: {
      movieId: movie.id,
    },
    orderBy: {
      language: "asc",
    },
  });
  return c.json({ subtitles: dbSubtitles }, 200);
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

  await prisma.subtitle.update({
    where: {
      id: dbMovie.subtitles[0].id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADING,
    },
  });

  try {
    await new YtsProxyApi().downloadSubtitles({
      subtitles: dbMovie.subtitles[0],
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

  return c.json({ message: "Subtitles downloaded" }, 200);
};

export const subscribeToMovie = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TPostMovieSubscribeSchemas["urlParams"]>
  >
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

  const movieSub = await prisma.movieSubscription.findUnique({
    where: { movieId_userId: { movieId: dbMovie.id, userId } },
  });
  if (movieSub) {
    return c.json({ message: "Already subscribe to this movie" }, 409);
  }

  await prisma.movieSubscription.create({
    data: {
      movieId: dbMovie.id,
      userId,
    },
  });

  return c.json({ message: "Movie subscribed" }, 200);
};

export const unsubscribeFromMovie = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieSubscribeSchemas["urlParams"]>
  >
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

  const movieSub = await prisma.movieSubscription.findUnique({
    where: { movieId_userId: { movieId: dbMovie.id, userId } },
  });
  if (!movieSub) {
    return c.json({ message: "Already unsubscribe of this movie" }, 409);
  }

  await prisma.movieSubscription.delete({
    where: {
      movieId_userId: {
        movieId: dbMovie.id,
        userId,
      },
    },
  });

  return c.json({ message: "Movie unsubscribed" }, 200);
};

export const likeMovie = async (
  c: Context<TIsLogged & TUrlParamsParser<TPostMovieLikeSchemas["urlParams"]>>
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
  c: Context<TIsLogged & TUrlParamsParser<TDeleteMovieLikeSchemas["urlParams"]>>
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });

  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await unlikeParent(id, movie.id, ParentTypes.MOVIE);
  return c.json({ message: result.message }, result.status);
};

export const getMovieComments = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TGetMovieCommentsSchemas["urlParams"]> &
      TSearchParamsParser<TGetMovieCommentsSchemas["searchParams"]>
  >
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { page, pageSize } = c.get("validatedSearchParams");
  const { id: userId } = c.get("user");

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  const result = await getParentComments(
    movie.id,
    ParentTypes.MOVIE,
    userId,
    page,
    pageSize
  );

  return c.json(
    getMovieCommentSchemas.response.parse({
      ...result.data,
      total: result.data.totalComments,
    }),
    200
  );
};

export const commentMovie = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPostMovieCommentSchemas["urlParams"]> &
      TBodyParser<TPostMovieCommentSchemas["requirements"]>
  >
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

export const putMovieWatchTimer = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPutMovieWatchTimerSchemas["urlParams"]> &
      TBodyParser<TPutMovieWatchTimerSchemas["requirements"]>
  >
) => {
  const { tmdbId } = c.get("validatedUrlParams");
  const { duration, timestamp } = c.get("validatedBody");
  const { id } = c.get("user");

  const movie = await prisma.movie.findUnique({ where: { tmdbId } });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await prisma.movieHistory.upsert({
    where: { movieId_userId: { movieId: movie.id, userId: id } },
    update: { duration, timestamp },
    create: { movieId: movie.id, userId: id, duration, timestamp },
  });

  return c.json({ message: "Movie watch timer updated" }, 200);
};

export const getMovieCasting = async (
  c: Context<TIsLogged & TUrlParamsParser<TGetMovieCastingSchema["urlParams"]>>
) => {
  const { tmdbId } = c.get("validatedUrlParams");

  const tmdbApi = new TmdbApi();
  const casting = tmdbId ? await tmdbApi.getMovieCasting(tmdbId) : null;
  if (!casting) {
    return c.json(
      {
        id: tmdbId,
        cast: [],
        crew: [],
      },
      200
    );
  }

  casting.crew.map((person) => {
    // @ts-expect-error - i18next is not typed
    person.job = i18next.t(`${person.department}.${person.job}`);
    return person;
  });

  return c.json(getMovieCastingSchema.response.parse(casting), 200);
};
