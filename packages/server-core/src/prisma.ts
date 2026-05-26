import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  hypertubePrisma?: PrismaClient;
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });

const getPrismaClient = (): PrismaClient => {
  if (!globalForPrisma.hypertubePrisma) {
    globalForPrisma.hypertubePrisma = createPrismaClient();
  }
  return globalForPrisma.hypertubePrisma;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
