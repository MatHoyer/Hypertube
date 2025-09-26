import { TPatchUsersSchemas } from "@hypertube/libs";
import { Context } from "hono";
import prisma from "../../lib/prisma";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const patchUser = async (
  c: Context<
    TUrlParamsParser<TPatchUsersSchemas["urlParams"]> &
      TBodyParser<TPatchUsersSchemas["requirements"]> &
      TIsLogged
  >
) => {
  const body = c.get("validatedBody");
  const { userId } = c.get("validatedUrlParams");
  const user = c.get("user");

  if (user.id !== userId) return c.json({ error: "Unauthorized" }, 401);

  await prisma.user.update({
    where: { id: userId },
    data: body,
  });
  return c.json({ data: "OK" }, 200);
};
