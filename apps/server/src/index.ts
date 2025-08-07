import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { YtsScrapper } from "./lib/scrappers/yts.scrapper.js";
import ytsRouter from "./routes/scrappers/yts.route.js";
import testRouter from "./routes/test/test.route.js";

const app = new Hono();

app.get(getUrl("api-health"), (c) => c.text("OK"));

app.onError((err: Error, c) => {
  console.error(err);
  return c.json({ error: "internal server error" }, 500);
});

app.use(logger(), cors());
app.route("/api/test", testRouter);
app.route("/api/scrappers/yts", ytsRouter);

app.get("/", async (c) => {
  const ytsScrapper = await YtsScrapper.create();
  console.log(ytsScrapper.searchParamsOptions);
  console.log(`${ytsScrapper.url}?${ytsScrapper.createSearchParams()}`);
  console.log(await ytsScrapper.defaultScrape());

  return c.json({});
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
