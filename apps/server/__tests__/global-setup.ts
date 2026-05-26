import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverCoreDir = resolve(__dirname, "../../../packages/server-core");
const dbConfigPath = resolve(__dirname, ".test-db.json");

export default async function globalSetup() {
  const container = await new PostgreSqlContainer("postgres:17-bookworm")
    .withDatabase("hypertube_test")
    .withUsername("postgres")
    .withPassword("postgres")
    .start();

  const databaseUrl = container.getConnectionUri();

  execSync("pnpm exec prisma migrate deploy", {
    cwd: serverCoreDir,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  writeFileSync(
    dbConfigPath,
    JSON.stringify({
      databaseUrl,
      host: container.getHost(),
      port: container.getMappedPort(5432),
      user: "postgres",
      password: "postgres",
      database: "hypertube_test",
    })
  );

  process.env.DATABASE_URL = databaseUrl;

  const globalForPrisma = globalThis as typeof globalThis & {
    hypertubePrisma?: { $disconnect: () => Promise<void> };
  };
  if (globalForPrisma.hypertubePrisma) {
    await globalForPrisma.hypertubePrisma.$disconnect();
    globalForPrisma.hypertubePrisma = undefined;
  }

  return async () => {
    await container.stop();
  };
}
