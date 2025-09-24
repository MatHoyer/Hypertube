import z from "zod";
import {
  movieSchema,
  resolutionSchema,
  subtitleSchema,
} from "../database/movie.schema.js";

export const tmdbMovieSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  imdb_id: z.string(),

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

export const getMoviesSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    name: z.string().optional(),
  }),
  response: z.object({
    movies: z.array(tmdbMovieSchema),
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
  response: z.object({
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
  }),
};
export type TGetMovieSchemas = {
  urlParams: z.infer<typeof getMovieSchemas.urlParams>;
  response: z.infer<typeof getMovieSchemas.response>;
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
