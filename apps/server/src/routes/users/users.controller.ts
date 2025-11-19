import {
  getUrl,
  newUTCDate,
  ROUTES,
  TPatchUsersSchemas,
} from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import { APIError } from "better-auth/api";
import { addHours, getTime } from "date-fns";
import { Context } from "hono";
import i18next from "i18next";
import { sign as jwtSign } from "jsonwebtoken";
import { sendVerificationEmail } from "../../emails/sendEmailVerification";
import { auth } from "../../lib/auth";
import { betterAuthErrorTranslation } from "../../lib/better-auth/constants";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const patchUser = async (
  c: Context<
    TUrlParamsParser<TPatchUsersSchemas["urlParams"]> &
      TBodyParser<TPatchUsersSchemas["requirements"]> &
      TIsLogged
  >
) => {
  const body = c.get("validatedBody");
  const { userId } = c.get("validatedUrlParams");
  const user = c.get("user");

  if (user.id !== userId) {
    return c.json({ message: i18next.t("httpCode.401") }, 401);
  }

  if (body.oldPassword && body.password) {
    try {
      await auth.api.changePassword({
        body: {
          currentPassword: body.oldPassword,
          newPassword: body.password,
        },
        headers: c.req.raw.headers,
      });
    } catch (e) {
      return c.json({ message: betterAuthErrorTranslation(e) }, 400);
    }
  } else if (body.password) {
    try {
      await auth.api.setPassword({
        body: { newPassword: body.password },
        headers: c.req.raw.headers,
      });
    } catch (e) {
      return c.json({ message: betterAuthErrorTranslation(e) }, 400);
    }
  }

  delete body.oldPassword;
  delete body.password;

  if (body.email) {
    const email = body.email.toLowerCase();

    const otherUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (otherUser) {
      return c.json(
        {
          message: i18next.t(
            "betterAuthError.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ),
        },
        400
      );
    }

    const token = jwtSign(
      {
        email: user.email,
        newEmail: email,
        exp: getTime(addHours(newUTCDate(), 1)),
        iat: getTime(newUTCDate()),
      },
      env.BETTER_AUTH_SECRET
    );
    const url = getUrl(ROUTES.API.AUTHENTIFICATION_EMAIL_VERIFICATION, {
      withUrl: "client",
      searchParams: { token },
    });

    try {
      await sendVerificationEmail({
        user,
        url,
        callbackURL: getUrl(ROUTES.CLIENT.SETTINGS, { withUrl: "client" }),
      });
    } catch (e) {
      if (e instanceof APIError) {
        return c.json({ message: betterAuthErrorTranslation(e) }, 429);
      }
      return c.json({ message: i18next.t("httpCode.400") }, 400);
    }
  }

  delete body.email;

  if (body.username) {
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });
    if (user) {
      return c.json(
        { message: auth.$ERROR_CODES.USERNAME_IS_ALREADY_TAKEN },
        400
      );
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: body,
  });
  return c.json({ message: "OK" }, 200);
};

export const getAccounts = async (c: Context<TIsLogged>) => {
  try {
    const accounts = await auth.api.listUserAccounts({
      headers: c.req.raw.headers,
    });
    return c.json({ data: accounts, message: "OK" }, 200);
  } catch (e) {
    return c.json({ data: {}, message: betterAuthErrorTranslation(e) }, 400);
  }
};

export const getSession = async (c: Context<TIsLogged>) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) return c.json({ data: {}, message: "No session found" }, 400);
    return c.json({ data: session, message: "OK" }, 200);
  } catch (e) {
    return c.json({ data: {}, message: betterAuthErrorTranslation(e) }, 400);
  }
};
