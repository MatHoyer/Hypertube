import z from "zod";
import { betterAuthProviders } from "../../const/global.const.js";
import { userSchema } from "../database/user.schema.js";

export const signUpAuthentificationSchemas = {
  requirements: z.object({
    email: userSchema.shape.email,
    username: userSchema.shape.username.unwrap().min(1).max(50),
    firstName: userSchema.shape.firstName.unwrap().min(1).max(50),
    lastName: userSchema.shape.lastName.unwrap().min(1).max(50),
    name: userSchema.shape.name,
    password: z.string().min(8).max(50),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TSignUpAuthentificationSchemas = {
  requirements: z.infer<typeof signUpAuthentificationSchemas.requirements>;
  response: z.infer<typeof signUpAuthentificationSchemas.response>;
};

export const signInAuthentificationSchemas = {
  requirements: z.object({
    username: userSchema.shape.username.unwrap(),
    password: z.string(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TSignInAuthentificationSchemas = {
  requirements: z.infer<typeof signInAuthentificationSchemas.requirements>;
  response: z.infer<typeof signInAuthentificationSchemas.response>;
};

export const signInSocialAuthentificationSchemas = {
  requirements: z.object({ providerId: z.enum(betterAuthProviders) }),
  response: z.object({
    url: z.url(),
    message: z.string(),
  }),
};

export type TSignInSocialAuthentificationSchemas = {
  requirements: z.infer<
    typeof signInSocialAuthentificationSchemas.requirements
  >;
  response: z.infer<typeof signInSocialAuthentificationSchemas.response>;
};

export const requestPasswordResetAuthentificationSchemas = {
  requirements: z.object({ email: userSchema.shape.email }),
  response: z.object({
    message: z.string(),
  }),
};

export type TRequestPasswordResetAuthentificationSchemas = {
  requirements: z.infer<
    typeof requestPasswordResetAuthentificationSchemas.requirements
  >;
  response: z.infer<
    typeof requestPasswordResetAuthentificationSchemas.response
  >;
};

export const resetPasswordAuthentificationSchemas = {
  requirements: z.object({
    newPassword: z.string().min(8).max(50),
    token: z.string(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TResetPasswordAuthentificationSchemas = {
  requirements: z.infer<
    typeof resetPasswordAuthentificationSchemas.requirements
  >;
  response: z.infer<typeof resetPasswordAuthentificationSchemas.response>;
};

export const signOutAuthentificationSchemas = {
  response: z.object({
    message: z.string(),
  }),
};

export type TSignOutAuthentificationSchemas = {
  response: z.infer<typeof signOutAuthentificationSchemas.response>;
};

export const emailVerificationAuthentificationSchemas = {
  searchParams: z.object({ token: z.string(), callbackURL: z.url() }),
  response: z.object({
    message: z.string(),
  }),
};

export type TEmailVerificationAuthentificationSchemas = {
  searchParams: z.infer<
    typeof emailVerificationAuthentificationSchemas.searchParams
  >;
  response: z.infer<typeof emailVerificationAuthentificationSchemas.response>;
};

export const linkProviderAuthentificationSchemas = {
  requirements: z.object({ providerId: z.enum(betterAuthProviders) }),
  response: z.object({
    url: z.url(),
    message: z.string(),
  }),
};

export type TLinkProviderAuthentificationSchemas = {
  requirements: z.infer<
    typeof linkProviderAuthentificationSchemas.requirements
  >;
  response: z.infer<typeof linkProviderAuthentificationSchemas.response>;
};

export const unlinkProviderAuthentificationSchemas = {
  urlParams: z.object({ providerId: z.enum(betterAuthProviders) }),
  response: z.object({
    message: z.string(),
  }),
};

export type TUnlinkProviderAuthentificationSchemas = {
  urlParams: z.infer<typeof unlinkProviderAuthentificationSchemas.urlParams>;
  response: z.infer<typeof unlinkProviderAuthentificationSchemas.response>;
};

export const deleteUserAuthentificationSchemas = {
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteUserAuthentificationSchemas = {
  response: z.infer<typeof deleteUserAuthentificationSchemas.response>;
};
