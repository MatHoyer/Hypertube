import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { YtsScrapper } from "./lib/scrapper/yts.scrapper.js";
import testRouter from "./routes/test/test.route.js";

const app = new Hono();

app.get(getUrl("api-health"), (c) => c.text("OK"));

app.onError((err: Error, c) => {
  console.error(err);
  return c.json({ error: "internal server error" }, 500);
});

app.use(logger(), cors());
app.route("/api/test", testRouter);

app.get("/", async (c) => {
  const ytsScrapper = await YtsScrapper.create();
  const data = ytsScrapper.createSearchParams();
  console.log(ytsScrapper.searchParamsOptions);

  return c.json({ data });
});

serve(
  {
    fetch: app.fetch,
    port: env.SERVER_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
