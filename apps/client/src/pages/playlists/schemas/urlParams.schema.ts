import { playlistSchema } from "@hypertube/libs";
import z from "zod";

export const PlaylistPageParamsSchema = z.object({
  playlistName: playlistSchema.shape.name.optional(),
});
