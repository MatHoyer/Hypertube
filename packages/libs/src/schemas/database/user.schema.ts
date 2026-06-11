import z from "zod";
import { imageSchema } from "./image.schema.js";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageId: imageSchema.shape.id.nullable(),
});
export type TUserSchema = z.infer<typeof userSchema>;
