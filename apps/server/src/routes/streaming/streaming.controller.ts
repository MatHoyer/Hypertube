import {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { BUCKETS, getStoragePath } from "@hypertube/server-core";
import { Context } from "hono";
import { buffer } from "stream/consumers";
import { container } from "../../container";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { isObjectNotFound } from "./streaming.utils";

export const getStreamingResolution = async (
  c: Context<TUrlParamsParser<TGetStreamingResolutionSchemas["urlParams"]>>
) => {
  const { movieId: tmdbId, resolutionId } = c.get("validatedUrlParams");

  const movieUrl = await container.storageService.presignedGetObject(
    BUCKETS.MOVIES,
    getStoragePath(tmdbId.toString(), "resolutions", resolutionId, "movie.mp4")
  );

  return c.redirect(movieUrl);
};

export const getStreamingSubtitles = async (
  c: Context<TUrlParamsParser<TGetStreamingSubtitlesSchemas["urlParams"]>>
) => {
  const { movieId: tmdbId, subtitlesLanguage } = c.get("validatedUrlParams");
  const objectName = getStoragePath(
    tmdbId.toString(),
    "subtitles",
    subtitlesLanguage,
    "subtitles.vtt"
  );

  try {
    const stream = await container.storageService.getObject(
      BUCKETS.MOVIES,
      objectName
    );
    const file = await buffer(stream);
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8" },
    });
  } catch (e) {
    if (isObjectNotFound(e)) {
      return c.json({ message: "Subtitles not found" }, 404);
    }
    throw e;
  }
};
