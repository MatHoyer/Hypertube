import { DownloadStates, hypertubeLogger, TMovieSchema } from "@hypertube/libs";
import {
  convertSrtToVtt,
  getResolutionPath,
  getSubtitlePath,
  prisma,
  TDownloadJobData,
  waitFile,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import path from "path";
import { downloader } from "./downloader.js";

const WAIT_FILE_TIMEOUT = 1000000;
const WAIT_SUBTITLE_TIMEOUT = 10000;
const CHECK_DOWNLOAD_INTERVAL = 30000;

const Status = {
  STOPPED: 0,
  CHECK_WAIT: 1,
  CHECKING: 2,
  DOWNLOAD_WAIT: 3,
  DOWNLOADING: 4,
  SEED_WAIT: 5,
  SEEDING: 6,
} as const;

const checkFileReadability = async (filePath: string) => {
  return new Promise<boolean>((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        hypertubeLogger.error(
          `File is NOT readable by ffmpeg: ${JSON.stringify(err)}`
        );
        resolve(false);
      } else {
        const duration = metadata?.format?.duration;
        const hasValidDuration =
          typeof duration === "number" &&
          Number.isFinite(duration) &&
          duration > 0;
        if (!hasValidDuration) {
          hypertubeLogger.info(
            `File readable but no valid duration yet (incomplete?): ${JSON.stringify(metadata?.format)}`
          );
          resolve(false);
        } else {
          hypertubeLogger.info(
            `File is readable, metadata: ${JSON.stringify(metadata.format)}`
          );
          resolve(true);
        }
      }
    });
  });
};

const convertMovie = (
  input: { path: string },
  output: { path: string },
  handler?: {
    onStart?: () => Promise<void>;
    onProgress?: (progress: { percent: number }) => Promise<void>;
    onEnd?: () => Promise<void>;
    onError?: (error: Error) => Promise<void>;
  }
): Promise<void> => {
  return new Promise((resolvePromise, rejectPromise) => {
    const run = async () => {
      const isReadable = await checkFileReadability(input.path);
      if (!isReadable) {
        rejectPromise(new Error("File is not readable"));
        return;
      }

      ffmpeg(input.path)
        .output(output.path)
        .inputOptions(["-fflags +genpts"])
        .outputOptions(["-c copy"])
        .on("start", async () => {
          hypertubeLogger.info(`Conversion started`);
          await handler?.onStart?.();
        })
        .on("progress", async (progress) => {
          hypertubeLogger.info(
            `Conversion progress: ${progress.percent?.toFixed(2) || 0}%`
          );
          await handler?.onProgress?.({ percent: progress.percent || 0 });
        })
        .on("end", async () => {
          hypertubeLogger.info(`Conversion ended`);
          await handler?.onEnd?.();
          resolvePromise();
        })
        .on("error", async (error) => {
          hypertubeLogger.error(`Conversion error: ${error}`);
          await handler?.onError?.(error);
          rejectPromise(
            error instanceof Error ? error : new Error(String(error))
          );
        })
        .run();
    };

    void run();
  });
};

const handleSrtFile = async (
  movie: TMovieSchema,
  srtFile: { name: string }
) => {
  const target = path.resolve(
    process.cwd(),
    `./downloads-transmission/incomplete/${srtFile.name}`
  );
  hypertubeLogger.info(`Waiting for SRT file to be downloaded ${target}`);
  await waitFile(target, WAIT_SUBTITLE_TIMEOUT);
  let language = srtFile.name.substring(
    srtFile.name.lastIndexOf("/") + 1,
    srtFile.name.lastIndexOf(".")
  );
  if (language.includes("[YTS.MX]")) {
    language = "YTS OFFICIAL - English";
  } else {
    language = "YTS - " + language;
  }

  const srtPath = getSubtitlePath({
    movieId: movie.tmdbId,
    language,
    filename: "subtitles.srt",
  });
  hypertubeLogger.info(`Copying SRT file to ${srtPath}`);
  await fs.promises.cp(target, srtPath, {
    recursive: true,
    force: true,
  });
  await convertSrtToVtt(srtPath);

  await prisma.subtitle.upsert({
    where: {
      downloadLink: srtFile.name,
    },
    update: {},
    create: {
      movieId: movie.id,
      language: language,
      rating: 5,
      downloadLink: srtFile.name,
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
};

export const downloadMovie = async (job: Job<TDownloadJobData>) => {
  const { movie, resolution } = job.data;
  const resolutionPath = `/downloads/${movie.tmdbId}/resolutions/${resolution}/resolution.torrent`;

  hypertubeLogger.info(`Downloading movie ${resolutionPath}`);

  const result = await downloader.addFile(resolutionPath, {
    "download-dir": `/downloads-transmission/${movie.tmdbId}/resolutions/${resolution}`,
    paused: true,
  });
  hypertubeLogger.info(`Torrent added with ID: ${result.id}`);

  try {
    const info = await downloader.get(result.id, ["files"]);
    const files = info.torrents[0].files as { name: string }[];

    const mp4File = files.find((file) => file.name.endsWith(".mp4"));
    if (!mp4File) {
      throw new Error("MP4 file not found");
    }
    hypertubeLogger.info(`MP4 file found ${mp4File.name}`);
    const srtFiles = files.filter((file) => file.name.endsWith(".srt"));
    if (srtFiles.length > 0) {
      hypertubeLogger.info(
        `${srtFiles.length} SRT files found ${srtFiles
          .map((file) => file.name)
          .join(", ")}`
      );
    }

    await downloader.start(result.id);

    const target = path.resolve(
      process.cwd(),
      `./downloads-transmission/incomplete/${mp4File.name}`
    );

    hypertubeLogger.info(`Waiting for file downloaded to be started ${target}`);
    await waitFile(target, WAIT_FILE_TIMEOUT);

    try {
      const srtPromises = srtFiles.map((srtFile) =>
        handleSrtFile(movie, srtFile)
      );
      await Promise.allSettled(srtPromises);
    } catch (error) {
      hypertubeLogger.error(`Error handling SRT files ${error}`);
    }

    hypertubeLogger.info(`Movie downloaded started successfully`);
    return new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          hypertubeLogger.info("Checking torrent status");
          const res = await downloader.get(result.id);
          const torrent = res.torrents[0];
          if (!torrent) {
            clearInterval(intervalId);
            reject(new Error("Torrent not found"));
            return;
          }
          hypertubeLogger.info(`Torrent found: ${torrent.name}`);

          const name = torrent.name;
          const percentDone = torrent.percentDone * 100;
          const downloadSpeed = torrent.rateDownload / 1024; // Ko/s
          const status = torrent.status;

          hypertubeLogger.info(`Status: ${status}`);
          hypertubeLogger.info(
            `Name: ${name}, Percent done: ${percentDone.toFixed(
              2
            )}, Download speed: ${downloadSpeed.toFixed(2)}, Status: ${status}`
          );

          if (status === Status.SEEDING || status === Status.STOPPED) {
            clearInterval(intervalId);

            const endFile = getResolutionPath({
              movieId: movie.tmdbId,
              resolution,
              forTransmission: true,
              filename: mp4File.name,
            });
            await waitFile(endFile);

            const moviePath = getResolutionPath({
              movieId: movie.tmdbId,
              resolution,
              forTransmission: false,
              filename: "movie.mp4",
            });

            try {
              await convertMovie(
                { path: endFile },
                {
                  path: moviePath,
                }
              );
              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
            return;
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(new Error(`Error in ending download: ${error}`));
        }
      }, CHECK_DOWNLOAD_INTERVAL);
    });
  } catch (error) {
    await downloader.remove(result.id);
  }
};
