import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

export const isLogged = () => {
  return createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "User is not logged" }, 401);
    c.set("user", session.user);
    await next();
  });
};
