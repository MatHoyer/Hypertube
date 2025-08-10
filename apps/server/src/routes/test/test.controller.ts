import type { TTestSchemas } from "@hypertube/libs";
import type { Context } from "hono";
import prisma from "../../lib/prisma";
import type { TBodyParser } from "../../middlewares/bodyParser";
import type { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getPrisma = async (c: Context) => {
  const profile = await prisma.profile.findFirst();
  return c.json(profile);
};

export const postPrisma = async (c: Context) => {
  await prisma.profile.create({});
  return c.text("Created");
};

export const postTest = async (
  c: Context<
    TUrlParamsParser<TTestSchemas["requirements"]> &
      TBodyParser<TTestSchemas["requirements"]>
  >
) => {
  const body = c.get("validatedBody");
  const urlParams = c.get("validatedUrlParams");
  return c.json({
    id: `${urlParams.id}+${body.id}`,
  });
};
