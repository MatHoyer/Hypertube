import type { Context } from "hono";
import prisma from "../lib/prisma.js";

export const getPrisma = async (c: Context) => {
  const profile = await prisma.profile.findFirst();
  return c.json(profile);
};

export const postPrisma = async (c: Context) => {
  await prisma.profile.create({});
  return c.text("Created");
};
