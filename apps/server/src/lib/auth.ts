import { getUrl, newUTCDate, TUserSchema } from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
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
import i18next from "i18next";
import { v5 } from "uuid";
import z from "zod";
import { mailTemplate } from "../emails/import-template";
import { sendVerificationEmail } from "../emails/sendEmailVerification";
import { betterAuthErrorTranslation } from "./better-auth/constants";
import { sendEmail } from "./resend";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const updatePassword = (newPassword: string) => {
  if (!newPassword)
    throw new APIError("BAD_REQUEST", {
      code: "FAILED_TO_UPDATE_PASSWORD",
    });
  if (!passwordRegex.test(newPassword)) {
    throw new APIError("BAD_REQUEST", {
      code: "PASSWORD_POLICY",
    });
  }
};

const updateUser = async (
  ctx: MiddlewareContext<
    MiddlewareOptions,
    AuthContext & {
      returned?: unknown;
      responseHeaders?: Headers;
    }
  >
) => {
  if (ctx.body.image) return;
  else if (ctx.body.firstName || ctx.body.lastName) {
    const session = await getSessionFromCtx(ctx);
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        code: "FAILED_TO_UPDATE_USER",
      });
    }
    const user = session.user;
    const fullName = `${ctx.body.firstName || user.firstName} ${
      ctx.body.lastName || user.lastName
    }`;
    return {
      context: {
        ...ctx,
        body: {
          ...ctx.body,
          name: fullName,
        },
      },
    };
  } else {
    throw new APIError("BAD_REQUEST", {
      code: "FAILED_TO_UPDATE_USER",
    });
  }
};

const updateEmail = (newEmail: string) => {
  const res = z.email().safeParse(newEmail);
  if (!newEmail || !res.success) {
    throw new APIError("BAD_REQUEST", {
      code: "COULDNT_UPDATE_YOUR_EMAIL",
    });
  }
};

const handleBetterAuthError = (
  ctx: MiddlewareContext<
    MiddlewareOptions,
    AuthContext & {
      returned?: unknown;
      responseHeaders?: Headers;
    }
  >
) => {
  try {
    throw new APIError("BAD_REQUEST", {
      code: ctx.query ? (ctx.query.error as string).toUpperCase() : undefined,
    });
  } catch (e) {
    throw ctx.redirect(
      getUrl("client-error", {
        withUrl: "client",
        searchParams: { error: betterAuthErrorTranslation(e) },
      })
    );
  }
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 50,
    sendResetPassword: async ({ user, url }) => {
      const tokenUrl = new URL(url);

      const token = tokenUrl.pathname.split("/").pop();

      if (!token) {
        throw new APIError("BAD_REQUEST", {
          code: "INVALID_TOKEN",
        });
      }

      const newUrl = getUrl("client-reset-password", {
        withUrl: "client",
        searchParams: { token },
      });

      await sendEmail({
        to: user.email,
        subject: i18next.t("email.password.resetPassword"),
        html: mailTemplate({
          title: i18next.t("email.password.resetPassword"),
          content: "",
          link: newUrl,
          linkText: i18next.t("email.password.reset"),
        }),
      });
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async (data) =>
      await sendVerificationEmail({
        user: data.user as TUserSchema,
        url: data.url,
        callbackURL: getUrl("client-signin", { withUrl: "client" }),
      }),
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
      emailCooldown: {
        type: "date",
        input: false,
        defaultValue: newUTCDate(),
      },
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      switch (ctx.path) {
        case "/sign-up/email":
          return updatePassword(ctx.body.password);
        case "/reset-password":
        case "/set-password":
        case "/change-password":
          return updatePassword(ctx.body.newPassword);
        case "/update-user":
          return updateUser(ctx);
        case "/change-email":
          return updateEmail(ctx.body.newEmail);
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
            return {
              id: v5(String(userInfo.id), customNamespace),
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
      mapProfileToUser: (e) => {
        return { ...e, username: null };
      },
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser: (e) => {
        return { ...e, username: null };
      },
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      mapProfileToUser: (e) => {
        return { ...e, username: null };
      },
    },
  },
});
