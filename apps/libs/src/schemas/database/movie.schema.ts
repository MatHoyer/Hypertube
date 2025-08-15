import { z } from "zod";
import { DownloadStates } from "../../const/global.const.js";

export const resolutionSchema = z.object({
  id: z.uuid(),

  resolution: z.string(),
  size: z.string(),
  downloadState: z.enum(DownloadStates),
});
export type TResolutionSchema = z.infer<typeof resolutionSchema>;

export const subtitleSchema = z.object({
  id: z.uuid(),

  language: z.string(),
  rating: z.coerce.number().int().positive(),
  downloadLink: z.url(),
  downloadState: z.enum(DownloadStates),
});
export type TSubtitleSchema = z.infer<typeof subtitleSchema>;

export const movieSchema = z.object({
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
export type TMovieSchema = z.infer<typeof movieSchema>;
