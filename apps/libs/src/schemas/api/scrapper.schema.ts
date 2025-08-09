import z from "zod";
import { movieSchemas } from "../database/movie.schema.js";

export const ytsMovieDataSchemas = z.object({
  resolutions: z.array(
    z.object({
      resolution: z.string(),
      size: z.string(),
      link: z.string(),
    })
  ),
  subtitlesLink: z.string(),
});
export type TYtsMovieDataSchemas = z.infer<typeof ytsMovieDataSchemas>;

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
    movies: z.array(
      movieSchemas.pick({ id: true, title: true, imageUrl: true })
    ),
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
  response: ytsMovieDataSchemas,
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
