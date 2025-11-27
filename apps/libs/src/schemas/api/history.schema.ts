import z from "zod";
import { DownloadStates } from "../../const/global.const.js";
import { movieSchema } from "../database/movie.schema.js";
import { tmdbMovieSchema } from "./movie.schema.js";

export const getHistorySchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
  }),
  response: z.object({
    movies: z.array(
      tmdbMovieSchema
        .extend({ downloadState: z.enum(DownloadStates) })
        .nullable(),
    ),
  }),
};
export type TGetHistorySchemas = {
  searchParams: z.infer<typeof getHistorySchemas.searchParams>;
  response: z.infer<typeof getHistorySchemas.response>;
};

export const deleteHistorySchemas = {
  response: z.object({
    message: z.string(),
  }),
};
export type TDeleteHistorySchemas = {
  response: z.infer<typeof deleteHistorySchemas.response>;
};

export const deleteMovieFromHistorySchemas = {
  urlParams: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
};
export type TDeleteMovieFromHistorySchemas = {
  urlParams: z.infer<typeof deleteMovieFromHistorySchemas.urlParams>;
};
