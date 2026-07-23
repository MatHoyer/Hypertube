import {
  getStreamingResolutionSchemas,
  getStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { TApiContext } from "../../middlewares/injectApiContext";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getStreamingResolution,
  getStreamingSubtitles,
} from "./streaming.controller";

const streamingRouter = new Hono<TApiContext>();

streamingRouter.get(
  "/movie/:movieId/resolution/:resolutionId",
  isLogged,
  urlParamsParser(getStreamingResolutionSchemas.urlParams),
  getStreamingResolution
);

streamingRouter.get(
  "/movie/:movieId/subtitles/:subtitlesLanguage",
  isLogged,
  urlParamsParser(getStreamingSubtitlesSchemas.urlParams),
  getStreamingSubtitles
);

export default streamingRouter;
