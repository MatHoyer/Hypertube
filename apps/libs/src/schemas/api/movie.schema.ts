import z from "zod";
import { DownloadStates } from "../../const/global.const.js";
import {
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
} from "../../const/tmdb.const.js";
import { typedKeys } from "../../utils/object.utils.js";
import { commentSchema } from "../database/comments.schema.js";
import {
  movieSchema,
  resolutionSchema,
  subtitleSchema,
} from "../database/movie.schema.js";
import { userSchema } from "../database/user.schema.js";

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

export const getMoviesSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    query: z.string().optional(),
    category: z.enum(tmdbCategories).optional(),
    sort: z.enum(tmdbSorts).optional(),
    genres: z
      .string()
      .regex(
        new RegExp(
          `^(${typedKeys(tmdbGenres).join("|")})(\\+(${typedKeys(
            tmdbGenres
          ).join("|")}))*$`
        )
      )
      .optional(),
  }),
  response: z.object({
    movies: z.array(
      tmdbMovieSchema.extend({ status: z.enum(DownloadStates) }).nullable()
    ),
    page: z.number(),
    totalPages: z.number(),
    totalResults: z.number(),
  }),
};
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
      ...tmdbMovieSchema.pick({
        original_title: true,
        original_language: true,
        title: true,
        overview: true,

        genres: true,

        vote_average: true,
        vote_count: true,
        popularity: true,

        poster_path: true,
        backdrop_path: true,

        release_date: true,
        adult: true,
      }).shape,
      ...movieSchema.shape,
      resolutions: z.array(resolutionSchema),
      subtitles: z.array(subtitleSchema),
      isSubscribed: z.boolean(),
      likesNumber: z.number().int().nonnegative(),
      isLikedByUser: z.boolean(),
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
    downloadStateChange: z.object({
      resolution: resolutionSchema.shape.resolution,
      downloadState: z.enum(DownloadStates),
    }),
    downloadProgress: z.object({
      resolution: resolutionSchema.shape.resolution,
      progress: z.coerce.number(),
    }),
  },
};
export type TGetMovieSSESchemas = {
  urlParams: z.infer<typeof getMovieSSESchemas.urlParams>;
  response: {
    downloadStateChange: z.infer<
      typeof getMovieSSESchemas.response.downloadStateChange
    >;
    downloadProgress: z.infer<
      typeof getMovieSSESchemas.response.downloadProgress
    >;
  };
};

export const postMovieDownloadResolutionSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
    resolution: resolutionSchema.shape.resolution,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPostMovieDownloadResolutionSchemas = {
  urlParams: z.infer<typeof postMovieDownloadResolutionSchemas.urlParams>;
  response: z.infer<typeof postMovieDownloadResolutionSchemas.response>;
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

export const getMovieCommentSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),
  response: z.object({
    comments: z.array(
      commentSchema
        .pick({
          id: true,
          content: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          user: userSchema.pick({
            id: true,
            username: true,
          }),
        })
    ),
    page: z.number(),
    pageSize: z.number(),
    totalComments: z.number(),
    totalPages: z.number(),
  }),
};

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

export const deleteMovieCommentSchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
    commentId: commentSchema.shape.id,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteMovieCommentSchemas = {
  urlParams: z.infer<typeof deleteMovieCommentSchemas.urlParams>;
  response: z.infer<typeof deleteMovieCommentSchemas.response>;
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
