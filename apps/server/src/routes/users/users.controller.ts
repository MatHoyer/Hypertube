import {
  getAccountsUsersSchemas,
  getSessionUsersSchemas,
  getUrl,
  getUserSchemas,
  getUsersSchemas,
  newUTCDate,
  ROUTES,
  TGetUsersSchemas,
  TPatchUsersSchemas,
} from "@hypertube/libs";
import { TGetUserSchemas } from "@hypertube/libs/src/schemas/api/users.schema";
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
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getUsers = async (
  c: Context<TIsLogged & TSearchParamsParser<TGetUsersSchemas["searchParams"]>>
) => {
  const { page, pageSize } = c.get("validatedSearchParams");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      firstName: true,
      lastName: true,
      image: true,
      createdAt: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.user.count();
  const totalPages = Math.ceil(total / pageSize);

  return c.json(
    getUsersSchemas.response.parse({
      users,
      page,
      pageSize,
      total,
      totalPages,
    }),
    200
  );
};

export const getUser = async (
  c: Context<TIsLogged & TUrlParamsParser<TGetUserSchemas["urlParams"]>>
) => {
  const { userId } = c.get("validatedUrlParams");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      firstName: true,
      lastName: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) return c.json(null, 404);

  const totalLikes = await prisma.like.count({
    where: { userId },
  });

  const totalComments = await prisma.comment.count({
    where: { userId },
  });

  return c.json(
    getUserSchemas.response.parse({
      user,
      stats: {
        totalLikes,
        totalComments,
      },
    }),
    200
  );
};

export const patchUser = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPatchUsersSchemas["urlParams"]> &
      TBodyParser<TPatchUsersSchemas["requirements"]>
  >
) => {
  const body = c.get("validatedBody");
  const { userId } = c.get("validatedUrlParams");
  const user = c.get("user");

  if (user.id !== userId) {
    return c.json(
      {
        message:
          "You are not authorized to modify information that is not yours",
      },
      401
    );
  }

  try {
    if (body.oldPassword && body.password) {
      await auth.api.changePassword({
        body: {
          currentPassword: body.oldPassword,
          newPassword: body.password,
        },
        headers: c.req.raw.headers,
      });
    } else if (body.password) {
      await auth.api.setPassword({
        body: { newPassword: body.password },
        headers: c.req.raw.headers,
      });
    }
  } catch (e) {
    return c.json({ message: betterAuthErrorTranslation(e) }, 400);
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

  const image = body.imageId
    ? `${env.SERVER_URL}/images/${body.imageId}.webp`
    : body.imageId;

  await prisma.user.update({
    where: { id: userId },
    data: { ...body, image },
  });
  return c.json({ message: "User updated successfully" }, 200);
};

export const getAccounts = async (c: Context<TIsLogged>) => {
  const accounts = await auth.api.listUserAccounts({
    headers: c.req.raw.headers,
  });
  return c.json(getAccountsUsersSchemas.response.parse({ accounts }), 200);
};

export const getSession = async (c: Context<TIsLogged>) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) return c.json(null, 400);

  return c.json(getSessionUsersSchemas.response.parse(session), 200);
};
