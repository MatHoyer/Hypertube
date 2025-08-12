import z from "zod";
import {
  movieSchemas,
  resolutionSchemas,
  subtitleSchemas,
} from "../database/movie.schema.js";

export const getYtsFiltersSchemas = {
  response: z.object({
    filters: z.record(z.string(), z.array(z.string())),
  }),
};
export type TGetYtsFiltersSchemas = {
  response: z.infer<typeof getYtsFiltersSchemas.response>;
};

export const getYtsMoviesSchemas = {
  searchParams: z.record(z.string(), z.string()),
  response: z.object({
    movies: z.array(movieSchemas),
  }),
};
export type TGetYtsMoviesSchemas = {
  searchParams: z.infer<typeof getYtsMoviesSchemas.searchParams>;
  response: z.infer<typeof getYtsMoviesSchemas.response>;
};

export const getYtsMovieDataSchemas = {
  urlParams: z.object({
    id: movieSchemas.shape.id,
  }),
  response: z.object({
    resolutions: z.array(
      resolutionSchemas.pick({ resolution: true, size: true })
    ),
    subtitles: z.array(subtitleSchemas),
  }),
};
export type TGetYtsMovieDataSchemas = {
  urlParams: z.infer<typeof getYtsMovieDataSchemas.urlParams>;
  response: z.infer<typeof getYtsMovieDataSchemas.response>;
};

export const getYtsPaginationSchemas = {
  searchParams: z.record(z.string(), z.string()),
  response: z.object({
    maxPagination: z.coerce.number().int().positive(),
  }),
};
export type TGetYtsPaginationSchemas = {
  searchParams: z.infer<typeof getYtsPaginationSchemas.searchParams>;
  response: z.infer<typeof getYtsPaginationSchemas.response>;
};

export const getYtsDownloadMovieSchemas = {
  urlParams: z.object({
    movieId: movieSchemas.shape.id,
    resolution: resolutionSchemas.shape.resolution,
    subtitles: z.union([subtitleSchemas.shape.language, z.literal("none")]),
  }),
};
export type TGetYtsDownloadMovieSchemas = {
  urlParams: z.infer<typeof getYtsDownloadMovieSchemas.urlParams>;
};
