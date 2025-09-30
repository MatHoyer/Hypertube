import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "../../env";
import { auth } from "../../lib/auth";

const authRouter = new Hono();

authRouter.use(
  "/*",
  cors({
    origin: [
      env.SERVER_URL.includes(":")
        ? env.SERVER_URL
        : env.SERVER_URL.split(":")[0] + ":" + env.CLIENT_PORT,
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

authRouter.on(["POST", "GET"], "/**", (c) => auth.handler(c.req.raw));

export default authRouter;
