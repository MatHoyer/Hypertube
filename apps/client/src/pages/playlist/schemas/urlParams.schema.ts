import { playlistSchema } from "@hypertube/libs";
import z from "zod";

export const PlaylistPageParamsSchema = z.object({
  playlistId: playlistSchema.shape.id,
});
