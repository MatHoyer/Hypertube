import z from "zod";
import { movieSchema, resolutionSchema } from "../database/movie.schema.js";

export const getStreamingResolutionSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.tmdbId,
    resolutionId: resolutionSchema.shape.id,
  }),
  response: z.object({ url: z.url() }),
};
export type TGetStreamingResolutionSchemas = {
  urlParams: z.infer<typeof getStreamingResolutionSchemas.urlParams>;
  response: z.infer<typeof getStreamingResolutionSchemas.response>;
};

export const getStreamingSubtitlesSchemas = {
  urlParams: z.object({
    movieId: movieSchema.shape.tmdbId,
    subtitlesLanguage: z.string(),
  }),
  response: z.object({ url: z.url() }),
};
export type TGetStreamingSubtitlesSchemas = {
  urlParams: z.infer<typeof getStreamingSubtitlesSchemas.urlParams>;
  response: z.infer<typeof getStreamingSubtitlesSchemas.response>;
};

export const getStreamingPreviewSchemas = {
  urlParams: z.object({ movieId: movieSchema.shape.tmdbId }),
  response: z.object({
    url: z.url(),
    metadata: z.object({
      cols: z.coerce.number(),
      rows: z.coerce.number(),
      width: z.coerce.number(),
      height: z.coerce.number(),
      tilewidth: z.coerce.number(),
      tileheight: z.coerce.number(),
    }),
  }),
};
export type TGetStreamingPreviewSchemas = {
  urlParams: z.infer<typeof getStreamingPreviewSchemas.urlParams>;
  response: z.infer<typeof getStreamingPreviewSchemas.response>;
};
