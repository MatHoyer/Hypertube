import {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { BUCKETS, getStoragePath } from "@hypertube/server-core";
import { Context } from "hono";
import { TApiContext } from "../../middlewares/injectApiContext";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getStreamingResolution = async (
  c: Context<
    TApiContext & TUrlParamsParser<TGetStreamingResolutionSchemas["urlParams"]>
  >
) => {
  const { movieId: tmdbId, resolutionId } = c.get("validatedUrlParams");
  const storageService = c.get("storageService");

  const url = await storageService.presignedGetObject(
    BUCKETS.MOVIES,
    getStoragePath(tmdbId.toString(), "resolutions", resolutionId, "movie.mp4")
  );

  return c.json({ url });
};

export const getStreamingSubtitles = async (
  c: Context<
    TApiContext & TUrlParamsParser<TGetStreamingSubtitlesSchemas["urlParams"]>
  >
) => {
  const { movieId: tmdbId, subtitlesLanguage } = c.get("validatedUrlParams");
  const storageService = c.get("storageService");

  const url = await storageService.presignedGetObject(
    BUCKETS.MOVIES,
    getStoragePath(
      tmdbId.toString(),
      "subtitles",
      subtitlesLanguage,
      "subtitles.vtt"
    )
  );

  return c.json({ url });
};
