import {
  getUrl,
  newUTCDate,
  ROUTES,
  TEmailVerificationAuthentificationSchemas,
  TLinkProviderAuthentificationSchemas,
  TRequestPasswordResetAuthentificationSchemas,
  TResetPasswordAuthentificationSchemas,
  TSignInAuthentificationSchemas,
  TSignInSocialAuthentificationSchemas,
  TSignUpAuthentificationSchemas,
  TUnlinkProviderAuthentificationSchemas,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { isBefore } from "date-fns";
import { Context } from "hono";
import i18next from "i18next";
import { decode } from "jsonwebtoken";
import z, { safeParse } from "zod";
import { auth } from "../../lib/auth";
import {
  checkPasswordRegex,
  handleAuthentificationMethod,
} from "../../lib/better-auth/constants";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const signUp = async (
  c: Context<TBodyParser<TSignUpAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  const signUpEmail = async () => {
    checkPasswordRegex(userData.password);
    return await auth.api.signUpEmail({
      body: userData,
      headers: c.req.raw.headers,
      asResponse: true,
    });
  };

  const successMessage = "Sign up successfully";
  return handleAuthentificationMethod(c, signUpEmail, successMessage);
};

export const signIn = async (
  c: Context<TBodyParser<TSignInAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  const signInUsername = async () => {
    return await auth.api.signInUsername({
      body: userData,
      headers: c.req.raw.headers,
      asResponse: true,
    });
  };

  const successMessage = "Sign in successfully";
  return handleAuthentificationMethod(c, signInUsername, successMessage);
};

export const signInSocial = async (
  c: Context<TBodyParser<TSignInSocialAuthentificationSchemas["requirements"]>>
) => {
  const { providerId } = c.get("validatedBody");

  const signInSocial = async () => {
    return await auth.api.signInSocial({
      body: {
        provider: providerId,
        callbackURL: getUrl(ROUTES.CLIENT.HOME, { withUrl: "client" }),
      },
      headers: c.req.raw.headers,
      asResponse: true,
    });
  };

  const successMessage = "Sign in with social provider successfully";
  return handleAuthentificationMethod(c, signInSocial, successMessage);
};

export const requestPasswordReset = async (
  c: Context<
    TBodyParser<TRequestPasswordResetAuthentificationSchemas["requirements"]>
  >
) => {
  const { email } = c.get("validatedBody");

  const requestPasswordReset = async () => {
    await auth.api.requestPasswordReset({
      body: { email },
      headers: c.req.raw.headers,
    });
  };

  const successMessage = "Request password reset successfully";
  return handleAuthentificationMethod(c, requestPasswordReset, successMessage);
};

export const resetPassword = async (
  c: Context<TBodyParser<TResetPasswordAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  const resetPassword = async () => {
    checkPasswordRegex(userData.newPassword);
    await auth.api.resetPassword({
      body: userData,
      headers: c.req.raw.headers,
    });
  };

  const successMessage = "Reset password successfully";
  return handleAuthentificationMethod(c, resetPassword, successMessage);
};

export const signOut = async (c: Context<TIsLogged>) => {
  const signOut = async () => {
    await auth.api.signOut({ headers: c.req.raw.headers });
  };

  const successMessage = "Sign out successfully";
  return handleAuthentificationMethod(c, signOut, successMessage);
};

const emailVerificationTokenSchema = z.object({
  email: z.string(),
  newEmail: z.string(),
  exp: z.number(),
  iat: z.number(),
});

export const emailVerification = async (
  c: Context<
    TSearchParamsParser<
      TEmailVerificationAuthentificationSchemas["searchParams"]
    >
  >
) => {
  const { token, callbackURL } = c.get("validatedSearchParams");

  const parsedToken = safeParse(emailVerificationTokenSchema, decode(token));
  if (!parsedToken.success) {
    return c.json({ message: i18next.t("email.error.invalidToken") }, 400);
  }

  const { email, newEmail, exp } = parsedToken.data;

  const emailChangerUser = await prisma.user.findUnique({ where: { email } });
  if (!emailChangerUser) {
    return c.json({ message: i18next.t("email.error.userNotFound") }, 404);
  }

  const expirationTime = newUTCDate(new Date(exp));

  if (isBefore(expirationTime, newUTCDate())) {
    return c.json({ message: i18next.t("email.error.expirationTime") }, 403);
  }

  await prisma.user.update({
    where: { email },
    data: { email: newEmail, emailVerified: true },
  });

  return c.redirect(callbackURL);
};

export const linkProvider = async (
  c: Context<
    TIsLogged &
      TBodyParser<TLinkProviderAuthentificationSchemas["requirements"]>
  >
) => {
  const { providerId } = c.get("validatedBody");

  const linkSocialAccount = async () => {
    return await auth.api.linkSocialAccount({
      body: {
        provider: providerId,
        callbackURL: getUrl(ROUTES.CLIENT.SETTINGS, { withUrl: "client" }),
      },
      headers: c.req.raw.headers,
      asResponse: true,
    });
  };

  const successMessage = "Link provider successfully";
  return handleAuthentificationMethod(c, linkSocialAccount, successMessage);
};

export const unlinkProvider = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TUnlinkProviderAuthentificationSchemas["urlParams"]>
  >
) => {
  const { providerId } = c.get("validatedUrlParams");

  const unlinkAccount = async () => {
    const accounts = await auth.api.listUserAccounts({
      headers: c.req.raw.headers,
    });
    const account = accounts.find(
      (account) => account.providerId === providerId
    );
    if (!account) return;

    await auth.api.unlinkAccount({
      body: { accountId: account.id },
      headers: c.req.raw.headers,
    });
  };

  const successMessage = "Unlink provider successfully";
  return handleAuthentificationMethod(c, unlinkAccount, successMessage);
};
