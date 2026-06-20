import { getUrl, ROUTES, TUserSchema } from "@hypertube/libs";
import { env, prisma, RedisCacheService } from "@hypertube/server-core";
import {
  AuthContext,
  betterAuth,
  MiddlewareContext,
  MiddlewareOptions,
} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { genericOAuth, username } from "better-auth/plugins";
import { v5 } from "uuid";
import { sendDeleteVerification } from "../emails/sendDeleteVerification";
import { sendVerificationEmail } from "../emails/sendEmailVerification";
import { sendResetPassword } from "../emails/sendResetPassword";
import { betterAuthErrorTranslation } from "./better-auth/constants";

const redisBetterAuth = new RedisCacheService();

type AuthMiddleware = MiddlewareContext<
  MiddlewareOptions,
  AuthContext & {
    returned?: unknown;
    responseHeaders?: Headers;
  }
>;

const beforeSendEmail = async (redisKey: string, userId: TUserSchema["id"]) => {
  const hasCooldown = await redisBetterAuth.has(`${redisKey}:${userId}`);
  if (hasCooldown) {
    throw new APIError("TOO_MANY_REQUESTS", {
      code: "TOO_MANY_EMAILS_SENT",
    });
  }

  redisBetterAuth.set(`${redisKey}:${userId}`, 1, 5 * 60);
};

const beforeSignIn = async (ctx: AuthMiddleware) => {
  const user = await prisma.user.findUnique({
    where: { username: ctx.body.username },
  });
  if (!user) {
    throw new APIError("UNAUTHORIZED", {
      code: "USER_NOT_FOUND",
    });
  }

  if (user.emailVerified) return;

  await beforeSendEmail("email", user.id);
};

const beforeRequestPasswordReset = async (ctx: AuthMiddleware) => {
  const user = await prisma.user.findUnique({
    where: { email: ctx.body.email },
  });
  if (!user) {
    throw new APIError("UNAUTHORIZED", {
      code: "USER_NOT_FOUND",
    });
  }

  await beforeSendEmail("password", user.id);
};

const beforeDeleteUser = async (ctx: AuthMiddleware) => {
  const session = await getSessionFromCtx(ctx);
  if (!session) {
    throw new APIError("UNAUTHORIZED", {
      code: "USER_NOT_FOUND",
    });
  }

  await beforeSendEmail("delete", session.user.id);
};

const handleBetterAuthError = (ctx: AuthMiddleware) => {
  let code;
  if (ctx.query && typeof ctx.query.error === "string") {
    code = ctx.query.error.toUpperCase();
  }
  const { message } = betterAuthErrorTranslation(
    new APIError("BAD_REQUEST", { code })
  );

  throw ctx.redirect(
    getUrl(ROUTES.CLIENT.ERROR, {
      withUrl: "client",
      searchParams: { error: message },
    })
  );
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 50,
    sendResetPassword: async (data) => {
      void sendResetPassword({
        user: data.user,
        url: data.url,
      });
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async (data) => {
      void sendVerificationEmail({
        user: data.user,
        url: data.url,
        callbackURL: getUrl(ROUTES.CLIENT.SIGNIN, { withUrl: "client" }),
      });
    },
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    additionalFields: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      imageId: { type: "string", input: false },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async (data) => {
        void sendDeleteVerification({
          user: data.user,
          url: data.url,
          callbackURL: getUrl(ROUTES.CLIENT.SIGNIN, { withUrl: "client" }),
        });
      },
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      disableImplicitLinking: true,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      switch (ctx.path) {
        case "/sign-in/username":
          return beforeSignIn(ctx);
        case "/request-password-reset":
          return beforeRequestPasswordReset(ctx);
        case "/delete-user":
          return beforeDeleteUser(ctx);
        case "/error":
          return handleBetterAuthError(ctx);
      }
    }),
  },
  trustedOrigins: [env.CLIENT_URL],
  plugins: [
    username({ minUsernameLength: 1, maxUsernameLength: 50 }),
    genericOAuth({
      config: [
        {
          providerId: "school42",
          clientId: env.SCHOOL_42_CLIENT_ID,
          clientSecret: env.SCHOOL_42_CLIENT_SECRET,
          authorizationUrl: "https://api.intra.42.fr/oauth/authorize",
          tokenUrl: "https://api.intra.42.fr/oauth/token",
          scopes: ["public"],
          getUserInfo: async (tokens) => {
            const response = await fetch("https://api.intra.42.fr/v2/me", {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            const userInfo = await response.json();
            const customNamespace = v5(env.BETTER_AUTH_URL, v5.URL);
            const id = v5(String(userInfo.id), customNamespace);
            return {
              id,
              email: userInfo.email,
              name: userInfo.displayname,
              createdAt: new Date(),
              emailVerified: true,
              updatedAt: new Date(),
              image: userInfo.image.link,
              firstName: userInfo.first_name,
              lastName: userInfo.last_name,
            };
          },
        },
      ],
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return { ...profile, username: null };
      },
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return { ...profile, username: null };
      },
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return { ...profile, username: null };
      },
    },
  },
});
