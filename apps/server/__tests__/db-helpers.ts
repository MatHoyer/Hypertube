import { prisma } from "@hypertube/server-core";
import { randomUUID } from "node:crypto";

const globalForPrisma = globalThis as typeof globalThis & {
  hypertubePrisma?: { $disconnect: () => Promise<void> };
};

export const resetPrismaClient = async () => {
  if (globalForPrisma.hypertubePrisma) {
    await globalForPrisma.hypertubePrisma.$disconnect();
    globalForPrisma.hypertubePrisma = undefined;
  }
};

export const seedUser = async () => {
  const id = randomUUID();
  return prisma.user.create({
    data: {
      id,
      name: "Test User",
      email: `test-${id}@example.com`,
      emailVerified: true,
    },
  });
};

export const cleanTables = async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Like", "Comment", "User" CASCADE'
  );
};
