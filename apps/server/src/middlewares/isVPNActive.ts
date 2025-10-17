import { env } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";

export const isVPNActive = createMiddleware(async (c, next) => {
  if (!env.VPN_IS_ACTIVE) {
    return c.json({ error: "VPN is needed and not active on the server" }, 403);
  }
  await next();
});
