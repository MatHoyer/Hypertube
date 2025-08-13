import z from "zod";
import { languageCodes } from "../../const/global.const.js";
import {
  ytsGenres,
  ytsQualities,
  ytsScrapperSortBy,
  ytsYears,
} from "../../const/yts.const.js";
import {
  movieSchemas,
  resolutionSchemas,
  subtitleSchemas,
} from "../database/movie.schema.js";

export const ytsScrapperSearchParamsSchemas = z.object({
  keyword: z.union([z.string(), z.literal("0")]),
  quality: z.enum(["all", ...Object.values(ytsQualities)]),
  genre: z.enum(["all", ...Object.values(ytsGenres)]),
  rating: z.number().int().positive().max(10),
  sort_by: z.enum(ytsScrapperSortBy),
  year: z.enum(ytsYears),
  language: z.enum(["all", ...Object.keys(languageCodes)]),
});
export type TYtsScrapperSearchParamsSchemas = z.infer<
  typeof ytsScrapperSearchParamsSchemas
>;

export const getYtsFiltersSchemas = {
  response: z.object({
    filters: z.record(z.string(), z.array(z.string())),
  }),
};
export type TGetYtsFiltersSchemas = {
  response: z.infer<typeof getYtsFiltersSchemas.response>;
};

export const getYtsMoviesSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive(),
    ...ytsScrapperSearchParamsSchemas.shape,
  }),
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
  searchParams: z.object({
    page: z.coerce.number().int().positive(),
    ...ytsScrapperSearchParamsSchemas.shape,
  }),
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
    subtitlesLanguage: z.union([
      subtitleSchemas.shape.language,
      z.literal("none"),
    ]),
  }),
};
export type TGetYtsDownloadMovieSchemas = {
  urlParams: z.infer<typeof getYtsDownloadMovieSchemas.urlParams>;
};
