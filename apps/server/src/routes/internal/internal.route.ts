import {
  postMovieDownloadJobEndedSchemas,
  postMovieDownloadJobStartedSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { internalTokenParser } from "../../middlewares/internalTokenParser";
import {
  movieDownloadJobEnd,
  movieDownloadJobStarted,
} from "./internal.controller";

const internalRouter = new Hono();

internalRouter.use("/*", internalTokenParser);

internalRouter.post(
  "/movie-download-job-started",
  bodyParser(postMovieDownloadJobStartedSchemas.requirements),
  movieDownloadJobStarted
);

internalRouter.post(
  "/movie-download-job-end",
  bodyParser(postMovieDownloadJobEndedSchemas.requirements),
  movieDownloadJobEnd
);

internalRouter.get("/test", (c) => c.json({ message: "OK" }));

export default internalRouter;
