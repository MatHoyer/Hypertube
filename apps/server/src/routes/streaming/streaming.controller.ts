import {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import {
  BUCKETS,
  getMoviePath,
  getSubtitlePath,
  minio,
} from "@hypertube/server-core";
import { Context } from "hono";
import { buffer } from "node:stream/consumers";
import { Readable } from "node:stream";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

const isObjectNotFound = (e: unknown): boolean => {
  if (e == null || typeof e !== "object") return false;
  const err = e as { code?: string; statusCode?: number };
  return (
    err.code === "NotFound" ||
    err.code === "NoSuchKey" ||
    err.statusCode === 404
  );
};

export const getStreamingResolution = async (
  c: Context<TUrlParamsParser<TGetStreamingResolutionSchemas["urlParams"]>>,
) => {
  const { movieId, resolution } = c.get("validatedUrlParams");
  const objectName = getMoviePath(
    String(movieId),
    resolution,
    "movie.mp4"
  );

  let fileSize: number;
  try {
    const stat = await minio.statObject(BUCKETS.MOVIES, objectName);
    fileSize = stat.size;
  } catch (e) {
    if (isObjectNotFound(e)) {
      return c.json({ message: "Movie file not found" }, 404);
    }
    throw e;
  }

  const range = c.req.header("range");

  if (range) {
    const [rawStart, rawEnd] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(rawStart, 10);
    const end = rawEnd ? parseInt(rawEnd, 10) : start + 5000000; // 5MB

    if (start >= fileSize) {
      c.header("Content-Range", `bytes */${fileSize}`);
      return c.json(
        {
          message: "Requested range not satisfiable",
        },
        416,
      );
    }

    const safeEnd = Math.min(end, fileSize - 1);
    const chunkSize = safeEnd - start + 1;

    const fileStream = await minio.getPartialObject(
      BUCKETS.MOVIES,
      objectName,
      start,
      chunkSize
    );

    c.header("Content-Range", `bytes ${start}-${safeEnd}/${fileSize}`);
    c.header("Accept-Ranges", "bytes");
    c.header("Content-Length", chunkSize.toString());
    c.header("Content-Type", "video/mp4");

    return new Response(Readable.toWeb(fileStream) as BodyInit, { status: 206 });
  }

  const fileStream = await minio.getObject(BUCKETS.MOVIES, objectName);
  c.header("Content-Length", fileSize.toString());
  c.header("Content-Type", "video/mp4");
  c.header("Accept-Ranges", "bytes");
  return new Response(Readable.toWeb(fileStream) as BodyInit);
};

export const getStreamingSubtitles = async (
  c: Context<TUrlParamsParser<TGetStreamingSubtitlesSchemas["urlParams"]>>,
) => {
  const { movieId, subtitlesLanguage } = c.get("validatedUrlParams");
  const objectName = getSubtitlePath(
    String(movieId),
    subtitlesLanguage,
    "subtitles.vtt"
  );

  try {
    const stream = await minio.getObject(BUCKETS.SUBTITLES, objectName);
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
