import { getUrl, ROUTES, TUserSchema } from "@hypertube/libs";
import { env, getRedisBetterAuth, prisma } from "@hypertube/server-core";
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
import { sendEmail } from "./mail";

const redisBetterAuth = getRedisBetterAuth();

const setPasswordCooldown = (id: string) => {
  redisBetterAuth.set(`${id}:password`, 1, "EX", 5 * 60);
};

const hasPasswordCooldown = async (id: string) => {
  return !!(await redisBetterAuth.get(`${id}:password`));
};

const setProviderEmail = (id: string, email: string) => {
  redisBetterAuth.set(id, email, "EX", 10);
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

type AuthMiddleware = MiddlewareContext<
  MiddlewareOptions,
  AuthContext & {
    returned?: unknown;
    responseHeaders?: Headers;
  }
>;

const normalizeUsername = (ctx: AuthMiddleware) => {
  const username = ctx.body.username as string;
  return {
    context: {
      ...ctx,
      body: {
        ...ctx.body,
        username: username.toLowerCase(),
      },
    },
  };
};

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

const updateUser = async (ctx: AuthMiddleware) => {
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

const handleBetterAuthError = (ctx: AuthMiddleware) => {
  throw ctx.redirect(
    getUrl(ROUTES.CLIENT.ERROR, {
      withUrl: "client",
      searchParams: {
        error: ctx.query
          ? (ctx.query.error as string).toUpperCase()
          : "UNEXPECTED_ERROR",
      },
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
    sendResetPassword: async ({ user, url }) => {
      const userInfo = user as TUserSchema;
      const hasCooldown = await hasPasswordCooldown(user.id);
      if (hasCooldown) {
        throw new APIError("TOO_MANY_REQUESTS", {
          code: "TOO_MANY_EMAILS_SENT",
        });
      }

      const tokenUrl = new URL(url);

      const token = tokenUrl.pathname.split("/").pop();

      if (!token) {
        throw new APIError("BAD_REQUEST", {
          code: "INVALID_TOKEN",
        });
      }

      const newUrl = getUrl(ROUTES.CLIENT.RESET_PASSWORD, {
        withUrl: "client",
        searchParams: { token },
      });

      setPasswordCooldown(user.id);

      await sendEmail({
        to: userInfo.email,
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
        callbackURL: getUrl(ROUTES.CLIENT.SIGNIN, { withUrl: "client" }),
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
    },
  },
  account: {
    additionalFields: {
      providerEmail: {
        type: "string",
        required: false,
        input: false,
      },
    },
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  databaseHooks: {
    account: {
      create: {
        before: async (account) => {
          const providerEmail = await redisBetterAuth.get(account.accountId);
          await redisBetterAuth.del(account.accountId);
          if (!providerEmail) return { data: account };

          return {
            data: {
              ...account,
              providerEmail,
            },
          };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      switch (ctx.path) {
        case "/sign-in/username":
          return normalizeUsername(ctx);
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
            const id = v5(String(userInfo.id), customNamespace);
            setProviderEmail(id, userInfo.email);
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
        setProviderEmail(profile.sub, profile.email);
        return { ...profile, username: null };
      },
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        if (profile.email) setProviderEmail(profile.id, profile.email);
        return { ...profile, username: null };
      },
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        if (profile.email) setProviderEmail(profile.id, profile.email);
        return { ...profile, username: null };
      },
    },
  },
});
