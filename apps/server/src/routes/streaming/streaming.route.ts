import {
  getYtsStreamingResolutionSchemas,
  getYtsStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getYtsStreamingResolution,
  getYtsStreamingSubtitles,
} from "./streaming.controller";

const streamingRouter = new Hono();

streamingRouter.get(
  "/movie/:movieId/resolution/:resolution",
  urlParamsParser(getYtsStreamingResolutionSchemas.urlParams),
  getYtsStreamingResolution
);

streamingRouter.get(
  "/movie/:movieId/subtitles/:subtitlesLanguage",
  urlParamsParser(getYtsStreamingSubtitlesSchemas.urlParams),
  getYtsStreamingSubtitles
);

export default streamingRouter;
