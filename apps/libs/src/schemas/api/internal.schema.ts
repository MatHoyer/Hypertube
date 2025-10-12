import { z } from "zod";
import { movieSchema, resolutionSchema } from "../database/movie.schema.js";

export const postMovieDownloadJobStartedSchemas = {
  requirements: z.object({
    movieId: movieSchema.shape.id,
    resolution: resolutionSchema.shape.resolution,
    success: z.coerce.boolean(),
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPostMovieDownloadJobStartedSchemas = {
  requirements: z.infer<typeof postMovieDownloadJobStartedSchemas.requirements>;
  response: z.infer<typeof postMovieDownloadJobStartedSchemas.response>;
};

export const postMovieDownloadJobEndedSchemas = {
  requirements: z.object({
    movieId: movieSchema.shape.id,
    resolution: resolutionSchema.shape.resolution,
    success: z.coerce.boolean(),
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TPostMovieDownloadJobEndedSchemas = {
  requirements: z.infer<typeof postMovieDownloadJobEndedSchemas.requirements>;
  response: z.infer<typeof postMovieDownloadJobEndedSchemas.response>;
};
