import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@hypertube/libs": resolve(__dirname, "../../packages/libs/src"),
      "@hypertube/server-core": resolve(
        __dirname,
        "../../packages/server-core/src"
      ),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["__tests__/**/*.unit.test.ts"],
          setupFiles: ["./__tests__/setup-env.ts"],
          isolate: true,
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          isolate: true,
          include: ["__tests__/**/*.integration.test.ts"],
          globalSetup: ["./__tests__/global-setup.ts"],
          setupFiles: [
            "./__tests__/setup-env.ts",
            "./__tests__/integration-setup.ts",
          ],
          testTimeout: 60_000,
          hookTimeout: 120_000,
          fileParallelism: false,
          pool: "forks",
          maxWorkers: 1,
          poolOptions: {
            forks: {
              singleFork: true,
            },
          },
          sequence: {
            concurrent: false,
          },
        },
      },
    ],
  },
});
