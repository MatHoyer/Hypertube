import {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import { getResolutionPath, getSubtitlePath } from "@hypertube/server-core";
import * as fs from "fs";
import { Context } from "hono";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getStreamingResolution = async (
  c: Context<TUrlParamsParser<TGetStreamingResolutionSchemas["urlParams"]>>
) => {
  const { movieId, resolution } = c.get("validatedUrlParams");
  const filePath = getResolutionPath(movieId, resolution, "movie.mp4");
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = c.req.header("range");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(filePath, { start, end });

    c.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    c.header("Accept-Ranges", "bytes");
    c.header("Content-Length", chunkSize.toString());
    c.header("Content-Type", "video/mp4");

    return new Response(fileStream as any, { status: 206 });
  } else {
    c.header("Content-Length", fileSize.toString());
    c.header("Content-Type", "video/mp4");
    const fileStream = fs.createReadStream(filePath);
    return new Response(fileStream as any);
  }
};

export const getStreamingSubtitles = async (
  c: Context<TUrlParamsParser<TGetStreamingSubtitlesSchemas["urlParams"]>>
) => {
  const { movieId, subtitlesLanguage } = c.get("validatedUrlParams");
  const filePath = getSubtitlePath(movieId, subtitlesLanguage, true);
  const file = fs.readFileSync(filePath);

  return c.body(file, 200, {
    "Content-Type": "text/vtt; charset=utf-8",
  });
};
