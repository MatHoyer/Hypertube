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
import { v4 } from "uuid";
import z from "zod";
import { mailTemplate } from "../emails/import-template";
import { env } from "../env";
import prisma from "./prisma";
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
    if (!session)
      throw new APIError("BAD_REQUEST", {
        code: "FAILED_TO_UPDATE_USER",
      });
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
  if (!newEmail)
    throw new APIError("BAD_REQUEST", {
      code: "COULDNT_UPDATE_YOUR_EMAIL",
    });
  const res = z.email().safeParse(newEmail);
  if (!res.success)
    throw new APIError("BAD_REQUEST", {
      code: "COULDNT_UPDATE_YOUR_EMAIL",
    });
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
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: mailTemplate({
          title: "Reset your password",
          content: "",
          link: url,
          linkText: "Reset",
        }),
      });
    },
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
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      switch (ctx.path) {
        case "/sign-up/email":
          return updatePassword(ctx.body.password);
        case "/reset-password":
          return updatePassword(ctx.body.newPassword);
        case "/update-user":
          return updateUser(ctx);
        case "/change-email":
          return updateEmail(ctx.body.newEmail);
      }
    }),
  },
  trustedOrigins: [
    env.HOSTNAME,
    `${env.HOSTNAME}:${env.CLIENT_PORT}`,
    `${env.HOSTNAME}:${env.DEPLOY_PORT}`,
  ],
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
            return {
              id: v4(),
              email: userInfo.email,
              name: userInfo.usual_full_name,
              createdAt: new Date(),
              emailVerified: true,
              updatedAt: new Date(),
              image: userInfo.image.link,
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
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
});
