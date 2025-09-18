import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { logger } from "hono/logger";
import i18next from "i18next";
import "./cron.js";
import { env } from "./env.js";
import "./lib/i18n/i18n.js";
import authRouter from "./routes/auth/auth.route.js";
import imageRouter from "./routes/image/image.route.js";
import ytsRouter from "./routes/scrappers/yts.route.js";
import streamingRouter from "./routes/streaming/streaming.route.js";
import swaggerRouter from "./routes/swagger/swagger.route.js";

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
    caches: [],
  }),
  async (c, next) => {
    i18next.changeLanguage(c.get("language"));
    await next();
  }
);

const apiRouter = new Hono();

apiRouter.route("/auth", authRouter);
apiRouter.route("/image", imageRouter);
apiRouter.route("/scrappers/yts", ytsRouter);
apiRouter.route("/streaming", streamingRouter);
apiRouter.route("/swagger", swaggerRouter);
apiRouter.get("/health", (c) => c.text("OK"));

app.route("/api", apiRouter);

if (env.NODE_ENV === "PROD") {
  app.use(
    "*",
    serveStatic({
      root: "./dist/public",
    })
  );
}

serve(
  {
    fetch: app.fetch,
    port: env.SERVER_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
