import { env } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";

export const internalTokenParser = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization");
  if (token !== env.INTERNAL_TOKEN) {
    return c.json({ error: "Invalid token" }, 401);
  }
  await next();
});
