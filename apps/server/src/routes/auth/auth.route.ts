import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "../../env";
import { auth } from "../../lib/auth";

const authRouter = new Hono();

authRouter.use(
  "/*",
  cors({
    origin: env.HOSTNAME,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

authRouter.on(["POST", "GET"], "/**", (c) => auth.handler(c.req.raw));

export default authRouter;
