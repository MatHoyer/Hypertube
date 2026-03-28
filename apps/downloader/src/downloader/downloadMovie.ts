import {
  DownloadStates,
  formatUnknownError,
  hypertubeLogger,
  TMovieSchema,
} from "@hypertube/libs";
import {
  BUCKETS,
  convertSrtToVtt,
  getMoviePath,
  getSubtitlePath,
  minio,
  prisma,
  TDownloadJobData,
  waitFile,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import { buffer } from "node:stream/consumers";
import path from "path";
import { notifySubscribers } from "../notifications/notifySubscriber.js";
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

const FFPROBE_LOW_MEM = [
  "-probesize",
  "2097152",
  "-analyzeduration",
  "1000000",
];

const checkFileReadability = async (filePath: string) => {
  return new Promise<boolean>((resolve) => {
    ffmpeg.ffprobe(filePath, FFPROBE_LOW_MEM, (err, metadata) => {
      if (err) {
        hypertubeLogger.error(
          `File is NOT readable by ffmpeg: ${formatUnknownError(err)}`
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
            `File readable but no valid duration yet (incomplete?): duration=${String(duration)}`
          );
          resolve(false);
        } else {
          hypertubeLogger.info(`File is readable, duration: ${duration}s`);
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
        .inputOptions([
          "-fflags",
          "+genpts",
          "-threads",
          "1",
          ...FFPROBE_LOW_MEM,
        ])
        .outputOptions([
          "-c",
          "copy",
          "-threads",
          "1",
          "-max_muxing_queue_size",
          "256",
        ])
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
          hypertubeLogger.error(
            `Conversion error: ${formatUnknownError(error)}`
          );
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

  const srtPath = `/downloads-transmission/${movie.tmdbId}/subtitles/${language}/subtitles.srt`;
  hypertubeLogger.info(`Copying SRT file to ${srtPath}`);
  await fs.promises.cp(target, srtPath, {
    recursive: true,
    force: true,
  });
  await convertSrtToVtt(srtPath);

  await minio.putObject(
    BUCKETS.SUBTITLES,
    getSubtitlePath(movie.tmdbId.toString(), language, "subtitles.vtt"),
    await fs.promises.readFile(srtPath)
  );

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

  const resolutionStream = await minio.getObject(
    BUCKETS.MOVIES,
    getMoviePath(movie.tmdbId.toString(), resolution, "resolution.torrent")
  );
  const torrentBuf = await buffer(resolutionStream);

  const downloadDir = `/downloads-transmission/${movie.tmdbId}/resolutions/${resolution}`;
  await fs.promises.mkdir(downloadDir, { recursive: true });
  hypertubeLogger.info(
    `Adding torrent for movie ${movie.tmdbId} resolution ${resolution}`
  );

  const result = await downloader.addTorrentMetainfo(torrentBuf, {
    "download-dir": downloadDir,
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

    const target = `/downloads-transmission/incomplete/${mp4File.name}`;

    hypertubeLogger.info(`Waiting for file downloaded to be started ${target}`);
    await waitFile(target, WAIT_FILE_TIMEOUT);

    try {
      const srtPromises = srtFiles.map((srtFile) =>
        handleSrtFile(movie, srtFile)
      );
      await Promise.allSettled(srtPromises);
    } catch (error) {
      hypertubeLogger.error(
        `Error handling SRT files: ${formatUnknownError(error)}`
      );
    }

    await prisma.resolution.update({
      where: {
        movieId_resolution: {
          movieId: movie.id,
          resolution,
        },
      },
      data: { downloadState: DownloadStates.DOWNLOADING },
    });
    notifySubscribers(movie.id, DownloadStates.DOWNLOADING);
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

            const endFile = downloadDir + "/" + mp4File.name;
            await waitFile(endFile);

            const moviePath = downloadDir + "/movie.mp4";

            try {
              await convertMovie(
                { path: endFile },
                {
                  path: moviePath,
                }
              );

              const movieStat = await fs.promises.stat(moviePath);
              await minio.putObject(
                BUCKETS.MOVIES,
                getMoviePath(movie.tmdbId.toString(), resolution, "movie.mp4"),
                fs.createReadStream(moviePath),
                movieStat.size
              );

              await fs.promises.rm(`/downloads-transmission/${movie.tmdbId}`, {
                recursive: true,
                force: true,
              });

              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
            return;
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(
            new Error(`Error in ending download: ${formatUnknownError(error)}`)
          );
        }
      }, CHECK_DOWNLOAD_INTERVAL);
    });
  } catch (error) {
    await downloader.remove(result.id);
  }
};
