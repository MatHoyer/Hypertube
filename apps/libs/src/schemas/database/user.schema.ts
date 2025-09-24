import z from "zod";
import { imageSchema } from "./image.schema.js";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  username: z.string().optional(),
  displayUsername: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageId: imageSchema.shape.id.nullable().optional(),
});
export type TUserSchema = z.infer<typeof userSchema>;
