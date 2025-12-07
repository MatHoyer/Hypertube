import z from "zod";
import { accountsSchema } from "../database/accounts.schema.js";
import { sessionSchema } from "../database/session.schema.js";
import { userSchema } from "../database/user.schema.js";

export const getUsersSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
  }),
  response: z.object({
    users: z.array(
      userSchema.pick({
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        firstName: true,
        lastName: true,
        image: true,
        createdAt: true,
      })
    ),
    page: z.number(),
    pageSize: z.number(),
    totalUsers: z.number(),
    totalPages: z.number(),
  }),
};

export type TGetUsersSchemas = {
  searchParams: z.infer<typeof getUsersSchemas.searchParams>;
  response: z.infer<typeof getUsersSchemas.response>;
};

export const getUserSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  response: z
    .object({
      user: userSchema.pick({
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        firstName: true,
        lastName: true,
        image: true,
        createdAt: true,
      }),
      stats: z.object({
        totalLikes: z.number(),
        totalComments: z.number(),
      }),
    })
    .nullable(),
};

export type TGetUserSchemas = {
  urlParams: z.infer<typeof getUserSchemas.urlParams>;
  response: z.infer<typeof getUserSchemas.response>;
};

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
