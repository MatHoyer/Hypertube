import { serve } from "@hono/node-server";
import { getUrl } from "@hypertube/libs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { logger } from "hono/logger";
import i18next from "i18next";
import { env } from "./env.js";
import "./lib/i18n/i18n.js";
import authRouter from "./routes/auth/auth.route.js";
import ytsRouter from "./routes/scrappers/yts.route.js";

const app = new Hono();

app.onError((err: Error, c) => {
  console.error(err);
  return c.json({ error: "internal server error" }, 500);
});

app.use(
  logger(),
  cors(),
  languageDetector({
    convertDetectedLanguage: (lang) => lang.split("-")[0],
    supportedLanguages: ["en", "fr", "es"],
    fallbackLanguage: "en",
  }),
  async (c, next) => {
    i18next.changeLanguage(c.get("language"));
    await next();
  }
);

// Routes
app.get("/", async (c) => {
  return c.json({
    message: i18next.t("global.hello"),
  });
});

app.get(getUrl("api-health"), (c) => c.text("OK"));

app.route("/api/scrappers/yts", ytsRouter);

app.route(getUrl("api-auth"), authRouter);

serve(
  {
    fetch: app.fetch,
    port: env.SERVER_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
