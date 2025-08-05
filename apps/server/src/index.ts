import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import testRouter from "./routes/test/test.route.js";

const app = new Hono();

app.get(getUrl("api-health"), (c) => c.text("OK"));

app.use(logger(), cors());
app.route("/api/test", testRouter);

console.log(env);

serve(
  {
    fetch: app.fetch,
    port: env.SERVER_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
