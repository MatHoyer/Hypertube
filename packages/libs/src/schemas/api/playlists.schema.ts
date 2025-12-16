import z from "zod";
import { DownloadStates } from "../../const/global.const.js";
import { movieSchema } from "../database/movie.schema.js";
import {
  playlistMovieSchema,
  playlistSchema,
} from "../database/playlist.schema.js";
import { tmdbMovieCompleteSchema } from "./movie.schema.js";

export const getPlaylistsSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
  }),
  response: z.object({
    playlists: z.array(
      z.object({
        ...playlistSchema.shape,
        movies: z.array(
          z.object({
            ...playlistMovieSchema.shape,
            tmdbId: movieSchema.shape.tmdbId,
          })
        ),
      })
    ),
    totalCount: z.number(),
  }),
};

export type TGetPlaylistsSchemas = {
  searchParams: z.infer<typeof getPlaylistsSchemas.searchParams>;
  response: z.infer<typeof getPlaylistsSchemas.response>;
};

export const getPlaylistSchemas = {
  urlParams: z.object({ playlistId: playlistSchema.shape.id }),
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
  }),
  response: z.object({
    name: playlistSchema.shape.name,
    movies: z.array(
      z.object({
        details: tmdbMovieCompleteSchema,
        downloadState: z.enum(DownloadStates),
      })
    ),
    totalCount: z.number(),
  }),
};

export type TGetPlaylistSchemas = {
  urlParams: z.infer<typeof getPlaylistSchemas.urlParams>;
  searchParams: z.infer<typeof getPlaylistSchemas.searchParams>;
  response: z.infer<typeof getPlaylistSchemas.response>;
};

export const postPlaylistSchemas = {
  requirements: z.object({
    playlistName: playlistSchema.shape.name.trim().min(1),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostPlaylistSchemas = {
  requirements: z.infer<typeof postPlaylistSchemas.requirements>;
  response: z.infer<typeof postPlaylistSchemas.response>;
};

export const deletePlaylistSchemas = {
  urlParams: z.object({ playlistId: playlistSchema.shape.id }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeletePlaylistSchemas = {
  urlParams: z.infer<typeof deletePlaylistSchemas.urlParams>;
  response: z.infer<typeof deletePlaylistSchemas.response>;
};

export const postMovieToPlaylistSchemas = {
  urlParams: z.object({ playlistId: playlistSchema.shape.id }),
  requirements: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostMovieToPlaylistSchemas = {
  urlParams: z.infer<typeof postMovieToPlaylistSchemas.urlParams>;
  requirements: z.infer<typeof postMovieToPlaylistSchemas.requirements>;
  response: z.infer<typeof postMovieToPlaylistSchemas.response>;
};

export const deleteMovieFromPlaylistSchemas = {
  urlParams: z.object({
    playlistId: playlistSchema.shape.id,
    tmdbId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteMovieFromPlaylistSchemas = {
  urlParams: z.infer<typeof deleteMovieFromPlaylistSchemas.urlParams>;
  response: z.infer<typeof deleteMovieFromPlaylistSchemas.response>;
};
