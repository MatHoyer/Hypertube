import { z } from "zod";

export const resolutionSchemas = z.object({
  id: z.uuid(),
  resolution: z.string(),
  link: z.url(),
});
export type TResolutionSchemas = z.infer<typeof resolutionSchemas>;

export const subtitleSchemas = z.object({
  id: z.uuid(),
  language: z.string(),
  rating: z.coerce.number().int().positive(),
  link: z.url(),
});
export type TSubtitleSchemas = z.infer<typeof subtitleSchemas>;

export const movieSchemas = z.object({
  id: z.uuid(),
  title: z.string(),
  year: z.coerce.number().int().positive().optional(),
  description: z.string().optional(),
  imageUrl: z.string(),
  link: z.url(),
});
export type TMovieSchemas = z.infer<typeof movieSchemas>;
