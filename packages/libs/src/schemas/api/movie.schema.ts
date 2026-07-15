import z from "zod";
import { MOVIE_EVENTS } from "../../const/events.js";
import { DownloadStates } from "../../const/global.const.js";
import {
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
} from "../../const/tmdb.const.js";
import { typedKeys } from "../../utils/object.utils.js";
import { commentResponseSchema } from "../database/comments.schema.js";
import {
  movieSchema,
  resolutionSchema,
  subtitleSchema,
} from "../database/movie.schema.js";
import { getPaginationSchemas } from "../utils/pagination.schema.js";

export const tmdbMovieSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  imdb_id: z.string().nullable(),

  original_title: z.string(),
  original_language: z.string(),
  title: z.string(),
  overview: z.string(),

  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),

  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),

  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),

  release_date: z.string(),
  adult: z.boolean(),
});

export type TTmdbMovieSchema = z.infer<typeof tmdbMovieSchema>;

export const tmdbMovieCompleteSchema = z.discriminatedUnion("hasDetails", [
  tmdbMovieSchema.extend({ hasDetails: z.literal(true) }),
  z.object({ id: tmdbMovieSchema.shape.id, hasDetails: z.literal(false) }),
]);

export type TTmdbMovieCompleteSchema = z.infer<typeof tmdbMovieCompleteSchema>;

export const getMoviesSchemas = getPaginationSchemas({
  searchParams: z.object({
    query: z.string().optional(),
    category: z.enum(tmdbCategories).optional(),
    sort: z.enum(tmdbSorts).optional(),
    genres: z
      .string()
      .regex(
        new RegExp(
          `^(${typedKeys(tmdbGenres).join("|")})(\\,(${typedKeys(
            tmdbGenres
          ).join("|")}))*$`
        )
      )
      .optional()
      .catch(undefined),
  }),
  response: z.object({
    movies: z.array(
      z.object({
        details: tmdbMovieCompleteSchema,
        downloadState: z.enum(DownloadStates),
        isSeen: z.boolean(),
      })
    ),
  }),
  options: { withPageSize: false },
});
export type TGetMoviesSchemas = {
  searchParams: z.infer<typeof getMoviesSchemas.searchParams>;
  response: z.infer<typeof getMoviesSchemas.response>;
};

export const getMovieSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z
    .object({
      details: tmdbMovieCompleteSchema,
      id: movieSchema.shape.id,
      isSubscribed: z.boolean(),
      likesNumber: z.number().int().nonnegative(),
      isLikedByUser: z.boolean(),
      watchedTimestamp: z.number().int().nonnegative(),
      preview: z.url(),
    })
    .nullable(),
};
export type TGetMovieSchemas = {
  urlParams: z.infer<typeof getMovieSchemas.urlParams>;
  response: z.infer<typeof getMovieSchemas.response>;
};

export const getMovieSSESchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: {
    [MOVIE_EVENTS.RESOLUTION_STATE_CHANGE]: z.object({
      resolutionId: resolutionSchema.shape.id,
      downloadState: z.enum(DownloadStates),
    }),
    [MOVIE_EVENTS.SUBTITLE_STATE_CHANGE]: z.object({
      id: subtitleSchema.shape.id,
      downloadState: subtitleSchema.shape.downloadState,
    }),
  },
};
export type TGetMovieSSESchemas = {
  urlParams: z.infer<typeof getMovieSSESchemas.urlParams>;
  response: {
    [MOVIE_EVENTS.RESOLUTION_STATE_CHANGE]: z.infer<
      typeof getMovieSSESchemas.response.resolutionStateChange
    >;
    [MOVIE_EVENTS.SUBTITLE_STATE_CHANGE]: z.infer<
      typeof getMovieSSESchemas.response.subtitleStateChange
    >;
  };
};

export const getMovieResolutionsSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({ resolutions: z.array(resolutionSchema) }),
};
export type TGetMovieResolutionsSchemas = {
  urlParams: z.infer<typeof getMovieResolutionsSchemas.urlParams>;
  response: z.infer<typeof getMovieResolutionsSchemas.response>;
};

export const postMovieDownloadResolutionSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
    resolutionId: resolutionSchema.shape.id,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPostMovieDownloadResolutionSchemas = {
  urlParams: z.infer<typeof postMovieDownloadResolutionSchemas.urlParams>;
  response: z.infer<typeof postMovieDownloadResolutionSchemas.response>;
};

export const getMovieSubtitlesSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({ subtitles: z.array(subtitleSchema) }),
};
export type TGetMovieSubtitlesSchemas = {
  urlParams: z.infer<typeof getMovieSubtitlesSchemas.urlParams>;
  response: z.infer<typeof getMovieSubtitlesSchemas.response>;
};

export const postMovieDownloadSubtitlesSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
    subtitlesLanguage: subtitleSchema.shape.language,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPostMovieDownloadSubtitlesSchemas = {
  urlParams: z.infer<typeof postMovieDownloadSubtitlesSchemas.urlParams>;
  response: z.infer<typeof postMovieDownloadSubtitlesSchemas.response>;
};

export const postMovieSubscribeSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostMovieSubscribeSchemas = {
  urlParams: z.infer<typeof postMovieSubscribeSchemas.urlParams>;
  response: z.infer<typeof postMovieSubscribeSchemas.response>;
};

export const deleteMovieSubscribeSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TDeleteMovieSubscribeSchemas = {
  urlParams: z.infer<typeof deleteMovieSubscribeSchemas.urlParams>;
  response: z.infer<typeof deleteMovieSubscribeSchemas.response>;
};

export const postMovieLikeSchemas = {
  urlParams: z.object({ tmdbId: movieSchema.shape.tmdbId }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostMovieLikeSchemas = {
  urlParams: z.infer<typeof postMovieLikeSchemas.urlParams>;
  response: z.infer<typeof postMovieLikeSchemas.response>;
};

export const deleteMovieLikeSchemas = {
  urlParams: z.object({ tmdbId: movieSchema.shape.tmdbId }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteMovieLikeSchemas = {
  urlParams: z.infer<typeof deleteMovieLikeSchemas.urlParams>;
  response: z.infer<typeof deleteMovieLikeSchemas.response>;
};

export const getMovieCommentSchemas = getPaginationSchemas({
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    comments: z.array(commentResponseSchema),
  }),
});

export type TGetMovieCommentsSchemas = {
  urlParams: z.infer<typeof getMovieCommentSchemas.urlParams>;
  searchParams: z.infer<typeof getMovieCommentSchemas.searchParams>;
  response: z.infer<typeof getMovieCommentSchemas.response>;
};

export const postMovieCommentSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  requirements: z.object({
    content: z.string().min(1).max(1000),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostMovieCommentSchemas = {
  urlParams: z.infer<typeof postMovieCommentSchemas.urlParams>;
  requirements: z.infer<typeof postMovieCommentSchemas.requirements>;
  response: z.infer<typeof postMovieCommentSchemas.response>;
};

export const putMovieWatchTimerSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  requirements: z.object({
    duration: z.number().int().nonnegative(),
    timestamp: z.number().int().nonnegative(),
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPutMovieWatchTimerSchemas = {
  urlParams: z.infer<typeof putMovieWatchTimerSchemas.urlParams>;
  requirements: z.infer<typeof putMovieWatchTimerSchemas.requirements>;
  response: z.infer<typeof putMovieWatchTimerSchemas.response>;
};

const tmdbMovieCastingPersonSchema = z.object({
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().nullable(),
  credit_id: z.string(),
});

export const tmdbMovieCastingSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  cast: z.array(
    tmdbMovieCastingPersonSchema.extend({
      cast_id: z.number(),
      character: z.string(),
      order: z.number(),
    })
  ),
  crew: z.array(
    tmdbMovieCastingPersonSchema.extend({
      job: z.string(),
    })
  ),
});

export type TTmdbMovieCastingSchema = z.infer<typeof tmdbMovieCastingSchema>;

export const getMovieCastingSchema = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: tmdbMovieCastingSchema,
};
export type TGetMovieCastingSchema = {
  urlParams: z.infer<typeof getMovieCastingSchema.urlParams>;
  response: z.infer<typeof getMovieCastingSchema.response>;
};
