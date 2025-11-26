import z from "zod";
import { movieSchema } from "../database/movie.schema.js";
import {
  playlistMovieSchema,
  playlistSchema,
} from "../database/playlist.schema.js";

export const getPlaylistsSchemas = {
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
  }),
};

export type TGetPlaylistsSchemas = {
  response: z.infer<typeof getPlaylistsSchemas.response>;
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
    movieId: movieSchema.shape.tmdbId,
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

export const deleteMovieToPlaylistSchemas = {
  urlParams: z.object({
    playlistId: playlistSchema.shape.id,
    movieId: movieSchema.shape.tmdbId,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteMovieToPlaylistSchemas = {
  urlParams: z.infer<typeof deleteMovieToPlaylistSchemas.urlParams>;
  response: z.infer<typeof deleteMovieToPlaylistSchemas.response>;
};
