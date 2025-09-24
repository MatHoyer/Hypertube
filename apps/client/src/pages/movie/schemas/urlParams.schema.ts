import { tmdbMovieSchema } from "@hypertube/libs";
import z from "zod";

export const MoviePageParamsSchema = z.object({
  tmdbId: tmdbMovieSchema.shape.id,
});
