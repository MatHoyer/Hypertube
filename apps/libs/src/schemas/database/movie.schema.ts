import { z } from "zod";

export const movieSchemas = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});
export type TMovieSchemas = z.infer<typeof movieSchemas>;

export const tmpMovieSchemas = z.object({
  id: z.uuid(),
  title: z.string(),
  imageUrl: z.string(),
  link: z.string(),
});
export type TTmpMovieSchemas = z.infer<typeof tmpMovieSchemas>;
