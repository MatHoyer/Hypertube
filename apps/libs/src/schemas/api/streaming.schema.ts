import z from "zod";
import { movieSchema } from "../database/movie.schema.js";

export const getStreamingResolutionSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    resolution: z.string(),
  }),
};
export type TGetStreamingResolutionSchemas = {
  urlParams: z.infer<typeof getStreamingResolutionSchemas.urlParams>;
};

export const getStreamingSubtitlesSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.id,
    subtitlesLanguage: z.string(),
  }),
};
export type TGetStreamingSubtitlesSchemas = {
  urlParams: z.infer<typeof getStreamingSubtitlesSchemas.urlParams>;
};
