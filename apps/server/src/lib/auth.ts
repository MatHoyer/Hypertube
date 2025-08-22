import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { username } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 50,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email" && ctx.body?.password) {
        if (!passwordRegex.test(ctx.body.password)) {
          throw new APIError("BAD_REQUEST", {
            code: "PASSWORD_POLICY",
          });
        }
      }
    }),
  },
  trustedOrigins: ["http://localhost:3001"],
  plugins: [username({ minUsernameLength: 1, maxUsernameLength: 50 })],
});
