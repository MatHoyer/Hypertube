import { v4 } from "uuid";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

const createDefaultUser = async () => {
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash("p");
  const user = await prisma.user.create({
    data: {
      id: v4(),
      username: "test",
      email: "test@test.com",
      name: "Test User",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  await prisma.account.create({
    data: {
      id: v4(),
      accountId: v4(),
      providerId: "credential",
      userId: user.id,
      accessToken: "test",
      refreshToken: "test",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
};

const main = async () => {
  await createDefaultUser();
};

main();
