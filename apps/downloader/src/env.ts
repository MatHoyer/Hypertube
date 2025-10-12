import * as dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  TRANSMISSION_HOST: z.string(),
  TRANSMISSION_RCP_PORT: z.coerce.number(),
  INTERNAL_TOKEN: z.string(),
});

export const env = envSchema.parse({
  ...process.env,
});
