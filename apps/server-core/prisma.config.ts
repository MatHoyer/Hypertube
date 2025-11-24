import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig, env } from "prisma/config";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schemas",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
