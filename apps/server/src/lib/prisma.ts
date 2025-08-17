import { PrismaClient } from "../../prisma/generated/client";
import { env } from "../env";

let prisma: PrismaClient;

if (env.NODE_ENV === "PROD") {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
