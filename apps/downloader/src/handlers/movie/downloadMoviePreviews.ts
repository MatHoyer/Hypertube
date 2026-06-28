import { hypertubeLogger } from "@hypertube/libs";
import {
  BUCKETS,
  getMoviePath,
  getMoviePreviewPath,
  minio,
} from "@hypertube/server-core";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";

type TpreviewMetadata = {
  duration: number;
  cols: number;
  rows: number;
  width: number;
  height: number;
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

const getDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration;
      if (!duration) return reject(new Error("No duration found"));

      resolve(duration);
    });
  });
};

const downloadMoviePreview = ({
  movieId,
  inputPath,
  outputDir,
  metadata,
}: {
  movieId: string;
  inputPath: string;
  outputDir: string;
  metadata: TpreviewMetadata;
}) => {
  const count = metadata.cols * metadata.rows;

  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .inputOptions([
        "-reconnect 1",
        "-reconnect_streamed 1",
        "-reconnect_delay_max 5",
      ])
      .outputOptions([
        "-vf",
        `fps=${count / metadata.duration},scale=240:-1,tile=${metadata.cols}x${metadata.rows}`,
        "-q:v",
        "10",
        "-start_number",
        "0",
      ])
      .output(`${outputDir}/preview.jpg`)
      .on("start", () => {
        hypertubeLogger.info(`Start download preview for : ${movieId}`);
      })
      .on("end", async () => {
        await putPreviewToObjectStockage(
          movieId,
          metadata,
          `${outputDir}/preview.jpg`
        );
        hypertubeLogger.info(`Finish download preview for : ${movieId}`);
        resolve();
      })
      .on("error", () => reject())
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
    const json = JSON.stringify(metadata);
    const buffer = Buffer.from(json);

    const stat = await fs.promises.stat(filepath);

    await Promise.all([
      minio.putObject(
        BUCKETS.MOVIES,
        getMoviePreviewPath(movieId, "preview.jpg"),
        fs.createReadStream(filepath),
        stat.size,
        { "Content-Type": "image/jpeg" }
      ),
      minio.putObject(
        BUCKETS.MOVIES,
        getMoviePreviewPath(movieId, "preview.json"),
        buffer,
        buffer.length,
        { "Content-Type": "application/json" }
      ),
    ]);
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

  const inputPath = await minio.presignedGetObject(
    BUCKETS.MOVIES,
    getMoviePath(movieId, resolutionId, filename)
  );
  const dir = `./downloads-transmission/${movieId}`;
  const outputDir = `${dir}/previews`;
  await fs.promises.mkdir(outputDir, { recursive: true });

  const duration = await getDuration(inputPath);
  const metadata: TpreviewMetadata = {
    duration,
    cols: 10,
    rows: 10,
    width: 240,
    height: -1,
  };

  await downloadMoviePreview({ movieId, inputPath, outputDir, metadata });
  await fs.promises.rm(dir, { recursive: true, force: true });
};
