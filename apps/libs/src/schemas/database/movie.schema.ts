import { z } from "zod";
import { DownloadStates } from "../../const/global.const.js";

export const resolutionSchema = z.object({
  id: z.uuid(),

  resolution: z.string(),
  size: z.string(),
  downloadState: z.enum([...Object.values(DownloadStates)] as const),
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

export const actorSchema = z.object({
  id: z.uuid(),

  imdbId: z.string(),
  name: z.string(),
  imageUrl: z.url().nullable(),
});
export type TMovieActorSchema = z.infer<typeof actorSchema>;

export const movieSchema = z.object({
  id: z.uuid(),

  title: z.string(),
  description: z.string().nullable(),
  imdbId: z.string(),
  year: z.coerce.number().int().positive(),
  rating: z.coerce.number().min(0).max(10).positive(),
  genres: z.array(z.string()),
  language: z.string(),
  ytTrailerCode: z.string().nullable(),

  backgroundImageUrl: z.url(),
  smallCoverImageUrl: z.url(),
  mediumCoverImageUrl: z.url(),
  largeCoverImageUrl: z.url(),
});
export type TMovieSchema = z.infer<typeof movieSchema>;

export const movieWithResolutionsSchema = movieSchema.extend({
  resolutions: z.array(resolutionSchema),
});
export type TMovieWithResolutionsSchema = z.infer<
  typeof movieWithResolutionsSchema
>;

export const movieWithSubtitlesSchema = movieSchema.extend({
  subtitles: z.array(subtitleSchema),
});
export type TMovieWithSubtitlesSchema = z.infer<
  typeof movieWithSubtitlesSchema
>;

export const movieWithResolutionsAndSubtitlesSchema =
  movieWithResolutionsSchema.extend({
    subtitles: z.array(subtitleSchema),
  });
export type TMovieWithResolutionsAndSubtitlesSchema = z.infer<
  typeof movieWithResolutionsAndSubtitlesSchema
>;
