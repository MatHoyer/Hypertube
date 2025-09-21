import {
  getStreamingResolutionSchemas,
  getStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getStreamingResolution,
  getStreamingSubtitles,
} from "./streaming.controller";

const streamingRouter = new Hono();

streamingRouter.get(
  "/movie/:movieId/resolution/:resolution",
  urlParamsParser(getStreamingResolutionSchemas.urlParams),
  getStreamingResolution
);

streamingRouter.get(
  "/movie/:movieId/subtitles/:subtitlesLanguage",
  urlParamsParser(getStreamingSubtitlesSchemas.urlParams),
  getStreamingSubtitles
);

export default streamingRouter;
