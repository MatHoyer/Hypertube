import z from "zod";
import { userSchema } from "../database/user.schema.js";

export const patchUsersSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  requirements: {
    ...userSchema
      .pick({
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        imageId: true,
      })
      .partial(),
  },
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
