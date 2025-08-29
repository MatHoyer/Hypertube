import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { genericOAuth, username } from "better-auth/plugins";
import { v4 } from "uuid";
import { mailTemplate } from "../emails/import-template";
import { env } from "../env";
import prisma from "./prisma";
import { sendEmail } from "./resend";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

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
        html: mailTemplate(
          {
            title: "Reset your password",
            content: "",
            link: url,
            linkText: "Reset",
          },
          { language: "en" }
        ),
      });
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email" && ctx.body?.password) {
        if (!passwordRegex.test(ctx.body.password)) {
          throw new APIError("BAD_REQUEST", {
            code: "PASSWORD_POLICY",
          });
        }
      } else if (ctx.path === "/reset-password" && ctx.body?.newPassword) {
        if (!passwordRegex.test(ctx.body.newPassword)) {
          throw new APIError("BAD_REQUEST", {
            code: "PASSWORD_POLICY",
          });
        }
      }
    }),
  },
  trustedOrigins: ["http://localhost:3001"],
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
