import z from "zod";
import { ytsGenres, ytsQualities } from "../../const/yts.const.js";
import { capitalizeAllWords } from "../../utils/string.utils.js";

export const movieTorrentSchema = z.object({
  quality: z.enum(ytsQualities),
  size: z.string(),
  url: z.string(),
  hash: z.string(),
  indexerName: z.string(),
  indexerId: z.number().int(),
  releaseGuid: z.string(),
});
export type TMovieTorrentSchema = z.infer<typeof movieTorrentSchema>;

export const ytsMovieActorSchema = z.object({
  name: z.string(),
  character_name: z.string().optional(),
  imdb_code: z.string(),
  url_small_image: z.string().optional(),
});
export type TYtsMovieActorSchema = z.infer<typeof ytsMovieActorSchema>;

export const ytsMovieSchema = z.object({
  id: z.number(),
  url: z.url(),
  imdb_code: z.string(),
  title_english: z.string(),
  title_long: z.string(),
  slug: z.string().refine((slug) => !slug.includes(" "), {
    message: "Slug must not contain spaces",
  }),
  year: z.number(),
  rating: z.number(),
  runtime: z.number(),
  genres: z.array(
    z.enum(ytsGenres.map((genre) => capitalizeAllWords(genre, "-")))
  ),
  description_full: z.string().optional(),
  yt_trailer_code: z.string().optional(),
  language: z.string(),
  background_image: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  torrents: z.array(movieTorrentSchema),
  cast: z.array(ytsMovieActorSchema).optional().default([]),
});
export type TYtsMovieSchema = z.infer<typeof ytsMovieSchema>;
