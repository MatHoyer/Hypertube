import {
  getUrl,
  newUTCDate,
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
import { Status } from "better-auth/*";
import { APIError } from "better-auth/api";
import { isBefore } from "date-fns";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import i18next from "i18next";
import { decode } from "jsonwebtoken";
import z, { safeParse } from "zod";
import { auth } from "../../lib/auth";
import { betterAuthErrorTranslation } from "../../lib/better-auth/constants";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const signUp = async (
  c: Context<TBodyParser<TSignUpAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  try {
    const res = await auth.api.signUpEmail({
      body: userData,
      headers: c.req.raw.headers,
      asResponse: true,
    });
    if (res.ok) return res;

    const responseData = await res.json();

    if (responseData.code) {
      throw new APIError(res.status as Status, {
        code: responseData.code,
      });
    }

    return c.json(responseData, res.status as ContentfulStatusCode);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const signIn = async (
  c: Context<TBodyParser<TSignInAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  try {
    const res = await auth.api.signInUsername({
      body: userData,
      headers: c.req.raw.headers,
      asResponse: true,
    });
    if (res.ok) return res;

    const responseData = await res.json();

    if (responseData.code) {
      throw new APIError(res.status as Status, {
        code: responseData.code,
      });
    }

    return c.json(responseData, res.status as ContentfulStatusCode);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const signInSocial = async (
  c: Context<TBodyParser<TSignInSocialAuthentificationSchemas["requirements"]>>
) => {
  const { providerId } = c.get("validatedBody");

  try {
    const { url } = await auth.api.signInSocial({
      body: {
        provider: providerId,
        callbackURL: getUrl("client-home", { withUrl: "client" }),
      },
      headers: c.req.raw.headers,
    });
    return c.json({ url }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const requestPasswordReset = async (
  c: Context<
    TBodyParser<TRequestPasswordResetAuthentificationSchemas["requirements"]>
  >
) => {
  const { email } = c.get("validatedBody");

  try {
    await auth.api.requestPasswordReset({
      body: { email },
      headers: c.req.raw.headers,
    });
    return c.json({ message: "OK" }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const resetPassword = async (
  c: Context<TBodyParser<TResetPasswordAuthentificationSchemas["requirements"]>>
) => {
  const userData = c.get("validatedBody");

  try {
    await auth.api.resetPassword({
      body: userData,
      headers: c.req.raw.headers,
    });
    return c.json({ message: "OK" }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const signOut = async (c: Context<TIsLogged>) => {
  try {
    await auth.api.signOut({ headers: c.req.raw.headers });
    return c.json({ data: "OK" }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
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

  try {
    const { url } = await auth.api.linkSocialAccount({
      body: {
        provider: providerId,
        callbackURL: getUrl("client-settings", { withUrl: "client" }),
      },
      headers: c.req.raw.headers,
    });
    return c.json({ url }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const unlinkProvider = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TUnlinkProviderAuthentificationSchemas["urlParams"]>
  >
) => {
  const { providerId } = c.get("validatedUrlParams");

  try {
    await auth.api.unlinkAccount({
      body: { providerId },
      headers: c.req.raw.headers,
    });
    return c.json({ data: "OK" }, 200);
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
  }
};
