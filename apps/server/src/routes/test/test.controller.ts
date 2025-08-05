import type { TTestSchemas } from "@hypertube/libs";
import type { Context } from "hono";
import prisma from "../../lib/prisma";
import type { TBodyParser } from "../../middlewares/bodyParser";

export const getPrisma = async (c: Context) => {
  const profile = await prisma.profile.findFirst();
  return c.json(profile);
};

export const postPrisma = async (c: Context) => {
  await prisma.profile.create({});
  return c.text("Created");
};

export const postTest = async (
  c: Context<TBodyParser<TTestSchemas["requirements"]>>
) => {
  const body = c.get("validatedBody");
  return c.json({
    id: `${c.req.param("id")}+${body.id}`,
  });
};
