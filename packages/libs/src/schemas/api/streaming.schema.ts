import z from "zod";
import { movieSchema, resolutionSchema } from "../database/movie.schema.js";

export const getStreamingResolutionSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.tmdbId,
    resolutionId: resolutionSchema.shape.id,
  }),
};
export type TGetStreamingResolutionSchemas = {
  urlParams: z.infer<typeof getStreamingResolutionSchemas.urlParams>;
};

export const getStreamingSubtitlesSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.tmdbId,
    subtitlesLanguage: z.string(),
  }),
};
export type TGetStreamingSubtitlesSchemas = {
  urlParams: z.infer<typeof getStreamingSubtitlesSchemas.urlParams>;
};
