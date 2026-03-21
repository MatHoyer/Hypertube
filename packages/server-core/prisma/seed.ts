import { hypertubeLogger } from "@hypertube/libs";
import { User } from "@prisma/client";
import { v4 } from "uuid";
import { prisma } from "../src/index.js";

const createDefaultUsers = async () => {
  const users: User[] = [];

  const user1 = {
    id: v4(),
    name: "John Doe",
    email: "john@demo.com",
    emailVerified: true,
    username: "johndoe",
    displayUsername: "JohnDoe",
    firstName: "John",
    lastName: "Doe",
  };
  const user1Db = await prisma.user.upsert({
    where: {
      email: user1.email,
    },
    update: {},
    create: user1,
  });
  users.push(user1Db);

  const user2 = {
    id: v4(),
    name: "Jane Smith",
    email: "jane@demo.com",
    emailVerified: true,
    username: "janesmith",
    displayUsername: "JaneSmith",
    firstName: "Jane",
    lastName: "Smith",
  };
  const user2Db = await prisma.user.upsert({
    where: {
      email: user2.email,
    },
    update: {},
    create: user2,
  });
  users.push(user2Db);

  const user3 = {
    id: v4(),
    name: "Bob Wilson",
    email: "bob@demo.com",
    emailVerified: true,
    username: "bobwilson",
    displayUsername: "BobWilson",
    firstName: "Bob",
    lastName: "Wilson",
  };
  const user3Db = await prisma.user.upsert({
    where: {
      email: user3.email,
    },
    update: {},
    create: user3,
  });
  users.push(user3Db);

  return users;
};

const main = async () => {
  try {
    hypertubeLogger.info("Starting seed...");

    await createDefaultUsers();
    hypertubeLogger.info("Users created successfully!");

    hypertubeLogger.info("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    hypertubeLogger.error(`Seed failed: ${error}`);
    process.exit(1);
  }
};

main();
