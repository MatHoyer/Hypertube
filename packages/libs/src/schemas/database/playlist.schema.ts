import z from "zod";
import { movieSchema } from "./movie.schema.js";
import { userSchema } from "./user.schema.js";

export const playlistMovieSchema = z.object({
  id: z.uuid(),
  playlistId: z.uuid(),
  movieId: movieSchema.shape.id,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TPlaylistMovieSchema = z.infer<typeof playlistMovieSchema>;

export const playlistSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  movies: z.array(playlistMovieSchema),
  userId: userSchema.shape.id,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TPlaylistSchema = z.infer<typeof playlistSchema>;
