import z from "zod";
import { userSchema } from "../database/user.schema.js";

export const patchUsersSchemas = {
  urlParams: z.object({ id: z.uuid() }),
  requirements: z.object({
    name: userSchema.shape.name.optional(),
    email: userSchema.shape.email.optional(),
    image: userSchema.shape.image,
    firstName: userSchema.shape.firstName,
    lastName: userSchema.shape.lastName,
  }),
  response: z.object({
    data: z.string().optional(),
    error: z.string().optional(),
  }),
};

export type TPatchUsersSchemas = {
  urlParams: z.infer<typeof patchUsersSchemas.urlParams>;
  requirements: z.infer<typeof patchUsersSchemas.requirements>;
  response: z.infer<typeof patchUsersSchemas.response>;
};
