import z from "zod";
import { accountsSchema } from "../database/accounts.schema.js";
import { sessionSchema } from "../database/session.schema.js";
import { userSchema } from "../database/user.schema.js";

export const patchUsersSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  requirements: z
    .object({
      ...userSchema.pick({ email: true, image: true, imageId: true }).shape,
      name: userSchema.shape.name.min(1),
      username: userSchema.shape.username.unwrap().min(1),
      firstName: userSchema.shape.firstName.unwrap().min(1),
      lastName: userSchema.shape.lastName.unwrap().min(1),
      oldPassword: z.string(),
      password: z.string(),
    })
    .partial()
    .refine((data) => (data.oldPassword ? data.password : true), {
      path: ["passwordOldNeedNew"],
    }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPatchUsersSchemas = {
  urlParams: z.infer<typeof patchUsersSchemas.urlParams>;
  requirements: z.infer<typeof patchUsersSchemas.requirements>;
  response: z.infer<typeof patchUsersSchemas.response>;
};

export const getAccountsUsersSchemas = {
  response: z
    .object({
      accounts: accountsSchema,
    })
    .nullable(),
};

export type TGetAccountsUsersSchemas = {
  response: z.infer<typeof getAccountsUsersSchemas.response>;
};

export const getSessionUsersSchemas = {
  response: z
    .object({
      session: sessionSchema,
      user: userSchema,
    })
    .nullable(),
};

export type TGetSessionUsersSchemas = {
  response: z.infer<typeof getSessionUsersSchemas.response>;
};
