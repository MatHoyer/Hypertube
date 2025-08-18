import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: { type: "string" },
      lastName: { type: "string" },
    },
  },
  trustedOrigins: ["http://localhost:3001"],
  plugins: [
    customSession(async ({ user, session }) => {
      const names = await prisma.user.findUnique({
        where: { id: user.id },
        select: { firstName: true, lastName: true },
      });
      return {
        user: {
          ...user,
          firstName: names?.firstName,
          lastName: names?.lastName,
        },
        session,
      };
    }),
  ],
});
