import z from "zod";
import { accountsSchema } from "../database/accounts.schema.js";
import { sessionSchema } from "../database/session.schema.js";
import { userSchema } from "../database/user.schema.js";
import { getPaginationSchemas } from "../utils/pagination.schema.js";

export const getUsersSchemas = getPaginationSchemas({
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
  }),
});

export type TGetUsersSchemas = {
  searchParams: z.infer<typeof getUsersSchemas.searchParams>;
  response: z.infer<typeof getUsersSchemas.response>;
};

export const getUserSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  response: z.object({
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
  }),
};

export type TGetUserSchemas = {
  urlParams: z.infer<typeof getUserSchemas.urlParams>;
  response: z.infer<typeof getUserSchemas.response>;
};

export const patchUsersSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  requirements: z
    .object({
      email: userSchema.shape.email.toLowerCase().trim(),
      name: userSchema.shape.name.min(1),
      username: userSchema.shape.username.unwrap().min(1).toLowerCase().trim(),
      firstName: userSchema.shape.firstName.unwrap().min(1),
      lastName: userSchema.shape.lastName.unwrap().min(1),
      oldPassword: z.string(),
      password: z.string(),
      imageId: userSchema.shape.imageId,
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

export const deleteUsersSchemas = {
  urlParams: z.object({ userId: userSchema.shape.id }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteUsersSchemas = {
  urlParams: z.infer<typeof deleteUsersSchemas.urlParams>;
  response: z.infer<typeof deleteUsersSchemas.response>;
};

export const getAccountsUsersSchemas = {
  response: z.object({
    accounts: accountsSchema,
  }),
};

export type TGetAccountsUsersSchemas = {
  response: z.infer<typeof getAccountsUsersSchemas.response>;
};

export const getSessionUsersSchemas = {
  response: z.object({
    session: sessionSchema,
    user: userSchema,
  }),
};

export type TGetSessionUsersSchemas = {
  response: z.infer<typeof getSessionUsersSchemas.response>;
};
