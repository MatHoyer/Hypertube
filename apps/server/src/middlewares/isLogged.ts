import { TUserSchema } from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { auth } from "../lib/auth";

export type TIsLogged = { Variables: { user: TUserSchema } };

export const isLogged = createMiddleware<TIsLogged>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    try {
      const token = c.req.header("Authorization");
      const decoded = jwt.verify(
        token?.split(" ")[1] as string,
        env.BETTER_AUTH_SECRET
      ) as { credentialId: string };

      const credential = await prisma.credential.findUnique({
        where: {
          id: decoded.credentialId,
        },
        include: {
          user: true,
        },
      });
      if (!credential) {
        return c.json({ error: "Credential not found" }, 404);
      }

      c.set("user", credential.user as TUserSchema);
      await next();
    } catch {
      return c.json({ error: "Invalid token" }, 400);
    }
    return c.json({ error: "User is not logged" }, 401);
  }

  c.set("user", session.user as TUserSchema);
  await next();
});
