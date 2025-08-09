import { z } from "zod";

export const movieSchemas = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  link: z.url(),
});
export type TMovieSchemas = z.infer<typeof movieSchemas>;
