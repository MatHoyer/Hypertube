import * as dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  SERVER_URL: z.string(),
  SERVER_PORT: z.coerce.number(),
  CLIENT_PORT: z.coerce.number(),
  DEPLOY_PORT: z.coerce.number(),
  RESEND_API_KEY: z.string(),
  RESEND_API_EMAIL_FROM: z.string(),
  RESEND_API_EMAIL_TO: z.string(),
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
  TMDB_TOKEN: z.string(),
  VPN_IS_ACTIVE: z.coerce.boolean().default(false),
  NODE_ENV: z.enum(["DEV", "PROD"]).default("DEV"),
});

export const env = envSchema.parse({
  ...process.env,
});
