import * as dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: "../../.env" });

const envSchema = z
  .object({
    POSTGRES_HOST: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
    SERVER_URL: z.url(),
    SERVER_PORT: z.coerce.number(),
    CLIENT_URL: z.url(),
    CLIENT_PORT: z.coerce.number(),
    MAIL_PROVIDER: z.enum(["resend", "mailpit"]),
    RESEND_API_KEY: z.string().optional(),
    MAIL_FROM: z.string(),
    MAILPIT_SMTP_HOST: z.string(),
    MAILPIT_SMTP_PORT: z.coerce.number(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    SCHOOL_42_CLIENT_ID: z.string(),
    SCHOOL_42_CLIENT_SECRET: z.string(),
    TRANSMISSION_HOST: z.string(),
    TRANSMISSION_RCP_PORT: z.coerce.number(),
    TRANSMISSION_TORRENT_PORT: z.coerce.number(),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.coerce.number().optional(),
    MINIO_URL: z.url(),
    MINIO_USE_SSL: z.coerce.boolean().optional().default(false),
    MINIO_ROOT_USER: z.string(),
    MINIO_ROOT_PASSWORD: z.string(),
    TMDB_TOKEN: z.string(),
    YTS_API_URL: z.url(),
    YTS_PROXY_URL: z.url(),
    YTS_PROXY_PORT: z.coerce.number(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    VPN_IS_ACTIVE: z.coerce.boolean().default(false),
    NODE_ENV: z.enum(["DEV", "PROD"]).default("DEV"),
  })
  .check(
    z.superRefine((data, ctx) => {
      if (data.MAIL_PROVIDER === "resend") {
        if (!data.RESEND_API_KEY) {
          ctx.addIssue({
            code: "custom",
            message: "RESEND_API_KEY is required when NODE_ENV is PROD",
            path: ["RESEND_API_KEY"],
          });
        }
      }
    })
  );

export const env = envSchema.parse({
  ...process.env,
});
