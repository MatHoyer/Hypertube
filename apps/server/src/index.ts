import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import {
  hypertubeLogger,
  languageCodesArray,
  zodTranslate,
} from "@hypertube/libs";
import { env } from "@hypertube/server-core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { logger } from "hono/logger";
import i18next from "i18next";
import "./lib/i18n/i18n.js";
import authRouter from "./routes/auth/auth.route.js";
import authentificationRouter from "./routes/authentification/authentification.route.js";
import imagesRouter from "./routes/images/images.route.js";
import moviesRouter from "./routes/movies/movies.route.js";
import streamingRouter from "./routes/streaming/streaming.route.js";
import swaggerRouter from "./routes/swagger/swagger.route.js";
import usersRouter from "./routes/users/users.route.js";

zodTranslate(i18next.t);

const app = new Hono();

app.onError((err: Error, c) => {
  hypertubeLogger.error(err.message);
  return c.json({ error: "internal server error" }, 500);
});

app.use(
  logger(),
  cors(),
  languageDetector({
    convertDetectedLanguage: (lang) => lang.split("-")[0],
    supportedLanguages: [...languageCodesArray],
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
apiRouter.route("/authentification", authentificationRouter);
apiRouter.route("/images", imagesRouter);
apiRouter.route("/users", usersRouter);
apiRouter.route("/movies", moviesRouter);
apiRouter.route("/streaming", streamingRouter);
apiRouter.route("/swagger", swaggerRouter);
apiRouter.get("/health", (c) => c.text("OK"));

app.route("/api", apiRouter);

app.use("/public/*", serveStatic({ root: "./" }));

if (env.NODE_ENV === "PROD") {
  app.use(
    serveStatic({
      root: "./dist/public",
    })
  );
  app.use(
    "*",
    serveStatic({
      root: "./dist/public",
      path: "index.html",
    })
  );
}

serve(
  {
    fetch: app.fetch,
    port: env.SERVER_PORT,
  },
  (info) => {
    hypertubeLogger.info(`Server is running on http://localhost:${info.port}`);
  }
);
