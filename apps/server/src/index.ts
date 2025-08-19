import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { downloadTorrent } from "./lib/bittorrent/bittorent.js";
import ytsRouter from "./routes/scrappers/yts.route.js";

const app = new Hono();

app.get(getUrl("api-health"), (c) => c.text("OK"));

app.onError((err: Error, c) => {
  console.error(err);
  return c.json({ error: "internal server error" }, 500);
});

app.use(logger(), cors());
app.route(
  getUrl("api-scrappers", {
    scrapper: "yts",
  }),
  ytsRouter
);
app.get("/api/bit", async (c) => {
  await downloadTorrent();

  return c.json({
    message: "Downloaded torrent",
  });
});

app.get("/", async (c) => {
  return c.json({
    message: "Welcome to Hypertube API",
  });
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
