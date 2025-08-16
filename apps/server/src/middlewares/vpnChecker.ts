import { createMiddleware } from "hono/factory";
import { env } from "../env";

export const vpnChecker = () => {
  return createMiddleware(async (c, next) => {
    if (!env.VPN_IS_ACTIVE) {
      return c.json(
        { error: "VPN is needed and not active on the server" },
        403
      );
    }
    await next();
  });
};
