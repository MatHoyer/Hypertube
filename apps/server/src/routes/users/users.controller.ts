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
  const { id } = c.get("validatedUrlParams");

  try {
    await prisma.user.update({
      where: { id: id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        updatedAt: new Date(),
      },
    });
  } catch {
    return c.json({ error: "Profile update failed" }, 400);
  }
  return c.json({ data: "OK" }, 200);
};
