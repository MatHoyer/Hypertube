import { z } from "zod";
import { ytsDownloadStates } from "../../const/yts.const.js";

export const resolutionSchemas = z.object({
  id: z.uuid(),

  resolution: z.string(),
  size: z.string(),
  downloadState: z.enum(Object.values(ytsDownloadStates)),
});
export type TResolutionSchemas = z.infer<typeof resolutionSchemas>;

export const subtitleSchemas = z.object({
  id: z.uuid(),

  language: z.string(),
  rating: z.coerce.number().int().positive(),
  downloadLink: z.url(),
  downloadState: z.enum(Object.values(ytsDownloadStates)),
});
export type TSubtitleSchemas = z.infer<typeof subtitleSchemas>;

export const movieSchemas = z.object({
  id: z.uuid(),

  title: z.string(),
  description: z.string().optional(),
  imdbId: z.string(),
  year: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().positive(),
  genres: z.array(z.string()),
  language: z.string(),
  ytTrailerCode: z.string().optional(),

  backgroundImageUrl: z.url(),
  smallCoverImageUrl: z.url(),
  mediumCoverImageUrl: z.url(),
  largeCoverImageUrl: z.url(),
});
export type TMovieSchemas = z.infer<typeof movieSchemas>;
