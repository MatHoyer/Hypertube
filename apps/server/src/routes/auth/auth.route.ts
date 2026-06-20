import { env } from "@hypertube/server-core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "../../lib/auth";
import { TApiContext } from "../../middlewares/injectApiContext";

const authRouter = new Hono<TApiContext>();

authRouter.use(
  "*",
  cors({
    origin: env.BETTER_AUTH_URL,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

authRouter.on(
  ["POST", "GET"],
  [
    "/callback/*",
    "/oauth2/callback/*",
    "/verify-email",
    "/error",
    "/delete-user/callback/*",
  ],
  (c) => auth.handler(c.req.raw)
);

export default authRouter;
