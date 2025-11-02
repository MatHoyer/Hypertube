import type { User } from "better-auth/types";
import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

export type TIsLoggedSafe = { Variables: { user: User | null } };

export const isLoggedSafe = createMiddleware<TIsLoggedSafe>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  await next();
});
