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
  HOSTNAME: z.string(),
  SERVER_PORT: z.coerce.number(),
  CLIENT_PORT: z.coerce.number(),
  RESEND_API_KEY: z.string(),
  RESEND_API_EMAIL_FROM: z.string(),
  RESEND_API_EMAIL_TO: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  VPN_IS_ACTIVE: z.coerce.boolean().default(false),
  NODE_ENV: z.enum(["DEV", "PROD"]).default("DEV"),
});

export const env = envSchema.parse({
  ...process.env,
});
