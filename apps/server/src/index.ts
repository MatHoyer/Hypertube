import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { env } from "./env.js";
import testRouter from "./routes/test.route.js";

const app = new Hono();

app.get(getUrl("api-health"), (c) => c.text("OK"));

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
