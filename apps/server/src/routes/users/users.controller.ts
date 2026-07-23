import {
  getAccountsUsersSchemas,
  getSessionUsersSchemas,
  getUrl,
  getUserSchemas,
  getUsersSchemas,
  newUTCDate,
  ROUTES,
  TDeleteUsersSchemas,
  TGetUserSchemas,
  TGetUsersSchemas,
  TPatchUsersSchemas,
  TUserSchema,
} from "@hypertube/libs";
import { env, ICacheService, prisma } from "@hypertube/server-core";
import { APIError } from "better-auth";
import { addHours, getTime } from "date-fns";
import { Context } from "hono";
import i18next from "i18next";
import { sign as jwtSign } from "jsonwebtoken";
import { sendVerificationEmail } from "../../emails/sendEmailVerification";
import { auth } from "../../lib/auth";
import {
  checkPasswordRegex,
  handleAuthentificationMethod,
} from "../../lib/better-auth/constants";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TApiContext } from "../../middlewares/injectApiContext";
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

const handleChangePassword = async ({
  c,
  password,
  oldPassword,
}: {
  c: Context;
  password: string | undefined;
  oldPassword: string | undefined;
}) => {
  if (!password) return;

  if (oldPassword) {
    const changePassword = async () => {
      checkPasswordRegex(password);
      return await auth.api.changePassword({
        body: {
          currentPassword: oldPassword,
          newPassword: password,
        },
        headers: c.req.raw.headers,
        asResponse: true,
      });
    };

    return handleAuthentificationMethod(c, changePassword);
  }

  const setPassword = async () => {
    checkPasswordRegex(password);
    return await auth.api.setPassword({
      body: { newPassword: password },
      headers: c.req.raw.headers,
      asResponse: true,
    });
  };

  return handleAuthentificationMethod(c, setPassword);
};

const handleChangeEmail = async ({
  c,
  cacheService,
  user,
  newEmail,
}: {
  c: Context;
  cacheService: ICacheService;
  user: TUserSchema;
  newEmail: string | undefined;
}) => {
  if (!newEmail) return;
  const email = newEmail.toLowerCase();

  const otherUser = await prisma.user.findUnique({ where: { email } });
  if (otherUser) {
    const message = i18next.t(
      "betterAuthError.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    );
    return c.json({ message }, 400);
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

  const handleSendVerificationEmail = async () => {
    const hasCooldown = await cacheService.has(`email:${user.id}`);
    if (hasCooldown) {
      throw new APIError("TOO_MANY_REQUESTS", {
        code: "TOO_MANY_EMAILS_SENT",
      });
    }

    cacheService.set(`email:${user.id}`, 1, 5 * 60);

    return void sendVerificationEmail({
      user,
      url,
      callbackURL: getUrl(ROUTES.CLIENT.SETTINGS, { withUrl: "client" }),
    });
  };

  return handleAuthentificationMethod(c, handleSendVerificationEmail);
};

export const patchUser = async (
  c: Context<
    TIsLogged &
      TApiContext &
      TUrlParamsParser<TPatchUsersSchemas["urlParams"]> &
      TBodyParser<TPatchUsersSchemas["requirements"]>
  >
) => {
  const body = c.get("validatedBody");
  const { userId } = c.get("validatedUrlParams");
  const user = c.get("user");
  const cacheService = c.get("cacheService");

  if (user.id !== userId) {
    const message = i18next.t("httpCode.401");
    return c.json({ message }, 401);
  }

  const passwordResponse = await handleChangePassword({
    c,
    password: body.password,
    oldPassword: body.oldPassword,
  });
  if (passwordResponse && !passwordResponse.ok) return passwordResponse;

  const emailResponse = await handleChangeEmail({
    c,
    cacheService,
    user,
    newEmail: body.email,
  });
  if (emailResponse && !emailResponse.ok) return emailResponse;

  if (body.username) {
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });
    if (user) {
      const message = i18next.t("betterAuthError.USERNAME_IS_ALREADY_TAKEN");
      return c.json({ message }, 400);
    }
  }

  const image = body.imageId
    ? `${env.S3_URL}/images/${body.imageId}.webp`
    : body.imageId;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      imageId: body.imageId,
      image,
    },
  });
  return c.json({ message: "User updated successfully" }, 200);
};

export const deleteUser = (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteUsersSchemas["urlParams"]>>
) => {
  const user = c.get("user");
  const { userId } = c.get("validatedUrlParams");

  if (user.id !== userId) return c.json(i18next.t("httpCode.401"), 401);

  const deleteUser = async () => {
    await auth.api.deleteUser({
      body: {},
      headers: c.req.raw.headers,
    });
  };

  const successMessage = "Account deletion email successfully sent";
  return handleAuthentificationMethod(c, deleteUser, successMessage);
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
