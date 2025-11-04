import { z } from "zod";
import { DownloadStates, Providers } from "../../const/global.const.js";

export const resolutionSchema = z.object({
  id: z.uuid(),

  resolution: z.string(),
  size: z.string(),
  downloadState: z.enum([...Object.values(DownloadStates)] as const),
  provider: z.enum([...Object.values(Providers)] as const).nullable(),
});
export type TResolutionSchema = z.infer<typeof resolutionSchema>;

export const subtitleSchema = z.object({
  id: z.uuid(),

  language: z.string(),
  rating: z.coerce.number().int().positive(),
  downloadLink: z.url(),
  downloadState: z.enum([...Object.values(DownloadStates)] as const),
});
export type TSubtitleSchema = z.infer<typeof subtitleSchema>;

export const movieSchema = z.object({
  id: z.uuid(),
  tmdbId: z.coerce.number(),
  imdbId: z.string().nullable(),
});
export type TMovieSchema = z.infer<typeof movieSchema>;
