import { hypertubeLogger } from "@hypertube/libs";
import {
  BUCKETS,
  getMoviePath,
  getMoviePreviewPath,
  minio,
} from "@hypertube/server-core";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import Stream from "stream";
import { VideoMetadata } from "./subtitle.utils.js";

type TpreviewMetadata = {
  duration: number;
  cols: number;
  rows: number;
  width?: number;
  height?: number;
  tileWidth: number;
  tileHeight: number;
};

const hasMoviePreview = async (movieId: string) => {
  try {
    await minio.getObject(
      BUCKETS.MOVIES,
      getMoviePreviewPath(movieId, "preview.jpg")
    );
    return true;
  } catch {
    return false;
  }
};

const downloadMoviePreview = ({
  movieId,
  stream,
  outputDir,
  movieMetadata,
}: {
  movieId: string;
  stream: Stream.Readable;
  outputDir: string;
  movieMetadata: VideoMetadata;
}) => {
  const cols = 10;
  const rows = 10;
  const widthScale = 240;
  let heightScale = 135; // 16:9 ratio by default
  if (movieMetadata.width && movieMetadata.height) {
    heightScale = movieMetadata.height * (widthScale / movieMetadata.width);
  }

  return new Promise<void>((resolve, reject) => {
    ffmpeg(stream)
      .inputOptions(["-threads", "1"])
      .outputOptions([
        "-vf",
        `fps=${(cols * rows) / movieMetadata.duration},scale=${widthScale}:${heightScale},tile=${cols}x${rows}`,
        "-q:v",
        "10",
      ])
      .output(`${outputDir}/preview.jpg`)
      .on("start", () => {
        hypertubeLogger.info(`Start download preview for : ${movieId}`);
      })
      .on("end", async () => {
        const metadata: TpreviewMetadata = {
          duration: movieMetadata.duration,
          cols,
          rows,
          width: movieMetadata.width,
          height: movieMetadata.height,
          tileWidth: widthScale,
          tileHeight: heightScale,
        };

        await putPreviewToObjectStockage(
          movieId,
          metadata,
          `${outputDir}/preview.jpg`
        );
        hypertubeLogger.info(`Finish download preview for : ${movieId}`);
        resolve();
      })
      .on("error", reject)
      .run();
  });
};

const putPreviewToObjectStockage = async (
  movieId: string,
  metadata: TpreviewMetadata,
  filepath: string
) => {
  hypertubeLogger.info(`Put preview on object storage for : ${movieId}`);
  try {
    const stat = await fs.promises.stat(filepath);

    await minio.putObject(
      BUCKETS.MOVIES,
      getMoviePreviewPath(movieId, "preview.jpg"),
      fs.createReadStream(filepath),
      stat.size,
      { "Content-Type": "image/jpeg", ...metadata }
    );
  } catch (e) {
    hypertubeLogger.error("Preview upload failed");
    throw e;
  }
};

export const downloadMoviePreviews = async (
  movieId: string,
  resolutionId: string,
  filename: string
): Promise<string[] | undefined> => {
  if (await hasMoviePreview(movieId)) return;

  const stream = await minio.getObject(
    BUCKETS.MOVIES,
    getMoviePath(movieId, resolutionId, filename)
  );
  const dir = `./downloads-transmission/${movieId}`;
  const outputDir = `${dir}/previews`;
  await fs.promises.mkdir(outputDir, { recursive: true });

  const { metaData } = await minio.statObject(
    BUCKETS.MOVIES,
    getMoviePath(movieId, resolutionId, filename)
  );

  await downloadMoviePreview({
    movieId,
    stream,
    outputDir,
    movieMetadata: metaData as VideoMetadata,
  });
  await fs.promises.rm(dir, { recursive: true, force: true });
};
