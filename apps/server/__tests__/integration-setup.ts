import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbConfig = JSON.parse(
  readFileSync(resolve(__dirname, ".test-db.json"), "utf-8")
) as {
  databaseUrl: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

process.env.DATABASE_URL = dbConfig.databaseUrl;
process.env.POSTGRES_HOST = dbConfig.host;
process.env.POSTGRES_PORT = String(dbConfig.port);
process.env.POSTGRES_USER = dbConfig.user;
process.env.POSTGRES_PASSWORD = dbConfig.password;
process.env.POSTGRES_DB = dbConfig.database;

const globalForPrisma = globalThis as typeof globalThis & {
  hypertubePrisma?: { $disconnect: () => Promise<void> };
};

if (globalForPrisma.hypertubePrisma) {
  await globalForPrisma.hypertubePrisma.$disconnect();
  globalForPrisma.hypertubePrisma = undefined;
}
