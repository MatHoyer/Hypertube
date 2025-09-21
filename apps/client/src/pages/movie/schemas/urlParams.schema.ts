import { tmdbMovieSchema } from "@hypertube/libs";
import z from "zod";

export const MoviePageParamsSchema = z.object({
  movieId: tmdbMovieSchema.shape.id,
});
