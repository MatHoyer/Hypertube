import { hypertubeLogger, TpreviewMetadata } from "@hypertube/libs";
import {
  BUCKETS,
  getStoragePath,
  TPreviewJobData,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import Stream, { PassThrough } from "stream";
import { storageService } from "../../main.js";
import { VideoMetadata } from "./download-torrent-subtitles.js";

const getMoviePreviewPath = (movieId: string) => `${movieId}/preview.jpg`;

const hasMoviePreview = async (movieId: string) => {
  try {
    await storageService.statObject(
      BUCKETS.MOVIES,
      getMoviePreviewPath(movieId)
    );
    return true;
  } catch {
    return false;
  }
};

const downloadMoviePreview = ({
  movieId,
  stream,
  movieMetadata,
}: {
  movieId: string;
  stream: Stream.Readable;
  movieMetadata: VideoMetadata;
}) => {
  const cols = 10;
  const rows = 10;
  const tileWidth = 240;
  let tileHeight = 135; // 16:9 ratio by default
  if (movieMetadata.width && movieMetadata.height) {
    tileHeight = movieMetadata.height * (tileWidth / movieMetadata.width);
  }

  const uploadStream = new PassThrough();

  return new Promise<void>((resolve, reject) => {
    ffmpeg(stream)
      .inputOptions(["-threads", "1"])
      .outputOptions([
        "-vf",
        `fps=${(cols * rows) / movieMetadata.duration},scale=${tileWidth}:${tileHeight},tile=${cols}x${rows}`,
        "-q:v",
        "10",
      ])
      .on("start", () => {
        hypertubeLogger.info(`Start download preview for : ${movieId}`);
      })
      .on("end", async () => {
        const metadata: TpreviewMetadata = {
          cols,
          rows,
          width: tileWidth * cols,
          height: tileHeight * rows,
          tileWidth,
          tileHeight,
        };

        await putPreviewToObjectStockage(movieId, metadata, uploadStream);
        hypertubeLogger.info(`Finish download preview for : ${movieId}`);
        resolve();
      })
      .on("error", (e) => {
        hypertubeLogger.error(`Movie preview error : ${e.message}`);
        reject();
      })
      .format("image2")
      .pipe(uploadStream, { end: true });
  });
};

const putPreviewToObjectStockage = async (
  movieId: string,
  metadata: TpreviewMetadata,
  uploadStream: PassThrough
) => {
  hypertubeLogger.info(`Put preview on object storage for : ${movieId}`);
  try {
    await storageService.putObject(
      BUCKETS.MOVIES,
      getMoviePreviewPath(movieId),
      uploadStream,
      undefined,
      { "Content-Type": "image/jpeg", ...metadata }
    );
  } catch (e) {
    hypertubeLogger.error("Preview upload failed");
    throw e;
  }
};

export const downloadMoviePreviews = async (
  job: Job<TPreviewJobData>
): Promise<string[] | undefined> => {
  const movieId = job.data.movie.tmdbId.toString();
  const resolutionId = job.data.resolutionId;

  if (await hasMoviePreview(movieId)) return;

  const stream = await storageService.getObject(
    BUCKETS.MOVIES,
    getStoragePath(movieId, "resolutions", resolutionId, "movie.mp4")
  );

  const { metaData } = await storageService.statObject(
    BUCKETS.MOVIES,
    getStoragePath(movieId, "resolutions", resolutionId, "movie.mp4")
  );

  await downloadMoviePreview({
    movieId,
    stream,
    movieMetadata: metaData as VideoMetadata,
  });
};
