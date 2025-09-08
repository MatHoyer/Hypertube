import z from "zod";
import { languageCodes } from "../../const/global.const.js";
import {
  ytsGenres,
  ytsQualities,
  ytsScrapperSortBy,
  ytsYears,
} from "../../const/yts.const.js";
import {
  actorSchema,
  movieSchema,
  resolutionSchema,
  subtitleSchema,
} from "../database/movie.schema.js";

export const ytsScrapperSearchParamsSchemas = z.object({
  keyword: z.union([z.literal("0"), z.string()]).default("0"),
  quality: z.enum(["all", ...Object.values(ytsQualities)]).default("all"),
  genre: z.enum(["all", ...Object.values(ytsGenres)]).default("all"),
  rating: z.number().int().positive().max(10).default(0),
  sort_by: z.enum(ytsScrapperSortBy).default("latest"),
  year: z.enum(ytsYears).default("0"),
  language: z.enum(["all", ...Object.keys(languageCodes)]).default("all"),
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
    page: z.coerce.number().int().positive().default(1),
    ...ytsScrapperSearchParamsSchemas.shape,
  }),
  response: z.object({
    movies: z.array(movieSchema),
  }),
};
export type TGetYtsMoviesSchemas = {
  searchParams: z.infer<typeof getYtsMoviesSchemas.searchParams>;
  response: z.infer<typeof getYtsMoviesSchemas.response>;
};

export const getYtsMovieDataSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
  }),
  response: z.object({
    ...movieSchema.shape,
    resolutions: z.array(resolutionSchema),
    actors: z.array(
      z.object({
        ...actorSchema.shape,
        characterName: z.string().optional(),
      })
    ),
    subtitles: z.array(subtitleSchema),
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

export const getYtsDownloadResolutionSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    resolution: resolutionSchema.shape.resolution,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TGetYtsDownloadResolutionSchemas = {
  urlParams: z.infer<typeof getYtsDownloadResolutionSchemas.urlParams>;
};

export const getYtsDownloadSubtitlesSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    subtitlesLanguage: subtitleSchema.shape.language,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TGetYtsDownloadSubtitlesSchemas = {
  urlParams: z.infer<typeof getYtsDownloadSubtitlesSchemas.urlParams>;
};

export const getYtsStreamingResolutionSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    resolution: resolutionSchema.shape.resolution,
  }),
};
export type TGetYtsStreamingResolutionSchemas = {
  urlParams: z.infer<typeof getYtsStreamingResolutionSchemas.urlParams>;
};

export const getYtsStreamingSubtitlesSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    subtitlesLanguage: subtitleSchema.shape.language,
  }),
};
export type TGetYtsStreamingSubtitlesSchemas = {
  urlParams: z.infer<typeof getYtsStreamingSubtitlesSchemas.urlParams>;
};
