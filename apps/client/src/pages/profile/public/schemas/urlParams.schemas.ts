import { userSchema } from "@hypertube/libs";
import z from "zod";

export const ProfilePageParamsSchema = z.object({
  userId: userSchema.shape.id,
});
