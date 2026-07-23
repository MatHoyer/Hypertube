import {
  getStreamingPreviewSchemas,
  getStreamingResolutionSchemas,
  getStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { TApiContext } from "../../middlewares/injectApiContext";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getStreamingPreview,
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

streamingRouter.get(
  "/movie/:movieId/preview",
  isLogged,
  urlParamsParser(getStreamingPreviewSchemas.urlParams),
  getStreamingPreview
);

export default streamingRouter;
