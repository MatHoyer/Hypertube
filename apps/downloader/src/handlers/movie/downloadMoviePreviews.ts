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

const downloadMoviePreview = ({
  movieId,
  stream,
  outputDir,
  metadata,
}: {
  movieId: string;
  stream: Stream.Readable;
  outputDir: string;
  metadata: TpreviewMetadata;
}) => {
  const count = metadata.cols * metadata.rows;

  return new Promise<void>((resolve, reject) => {
    ffmpeg(stream)
      .inputOptions(["-threads", "1"])
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

  const metadata: TpreviewMetadata = {
    duration: metaData.duration,
    cols: 10,
    rows: 10,
    width: 240,
    height: -1,
  };

  await downloadMoviePreview({ movieId, stream, outputDir, metadata });
  await fs.promises.rm(dir, { recursive: true, force: true });
};
