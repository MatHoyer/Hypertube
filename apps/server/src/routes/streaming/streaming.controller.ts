import {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "@hypertube/libs";
import {
  BUCKETS,
  getMoviePath,
  getSubtitlePath,
  minio,
  prisma,
} from "@hypertube/server-core";
import { Context } from "hono";
import { buffer } from "node:stream/consumers";
import { Readable } from "node:stream";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { isObjectNotFound, parseByteRange } from "./streaming.utils.js";

export const getStreamingResolution = async (
  c: Context<TUrlParamsParser<TGetStreamingResolutionSchemas["urlParams"]>>,
) => {
  const { movieId, resolutionId } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: { tmdbId: movieId },
    include: {
      resolutions: {
        where: { id: resolutionId },
      },
    },
  });
  if (!movie?.resolutions[0]) {
    return c.json({ message: "Resolution not found" }, 404);
  }

  const objectName = getMoviePath(String(movieId), resolutionId, "movie.mp4");

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
    const parsed = parseByteRange(range, fileSize);

    if ("unsatisfiable" in parsed) {
      c.header("Content-Range", `bytes */${fileSize}`);
      return c.json(
        {
          message: "Requested range not satisfiable",
        },
        416,
      );
    }

    const { start, chunkSize, safeEnd } = parsed;

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
