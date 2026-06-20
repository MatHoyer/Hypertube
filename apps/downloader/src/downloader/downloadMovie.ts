import {
  DownloadStates,
  formatUnknownError,
  hypertubeLogger,
  TMovieSchema,
} from "@hypertube/libs";
import {
  BUCKETS,
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
import { downloader, TransmissionTorrent } from "./downloader.js";
import {
  FFPROBE_LOW_MEM,
  formatSidecarSubtitleLanguage,
  handleEmbeddedSubtitles,
  isSidecarSubtitle,
  convertSubtitleFileToVtt,
} from "./subtitle.utils.js";

const WAIT_FILE_TIMEOUT = 1000000;
const WAIT_SUBTITLE_TIMEOUT = 10000;
const CHECK_DOWNLOAD_INTERVAL = 30000;
const COMPLETE_THRESHOLD = 0.99;

const Status = {
  STOPPED: 0,
  CHECK_WAIT: 1,
  CHECKING: 2,
  DOWNLOAD_WAIT: 3,
  DOWNLOADING: 4,
  SEED_WAIT: 5,
  SEEDING: 6,
} as const;

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".avi",
  ".m4v",
  ".webm",
  ".mov",
  ".wmv",
  ".flv",
  ".ts",
  ".m2ts",
];

type TorrentFile = { name: string; length?: number };

const isVideoFile = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const isTorrentComplete = (torrent: TransmissionTorrent): boolean =>
  torrent.percentDone >= COMPLETE_THRESHOLD ||
  torrent.status === Status.SEEDING;

const isTorrentStalled = (torrent: TransmissionTorrent): boolean =>
  torrent.status === Status.STOPPED &&
  torrent.percentDone < COMPLETE_THRESHOLD;

const findMainVideoFile = (files: TorrentFile[]): TorrentFile | undefined => {
  const videoFiles = files.filter((file) => isVideoFile(file.name));
  if (videoFiles.length === 0) return undefined;
  if (videoFiles.length === 1) return videoFiles[0];

  return videoFiles.reduce((largest, file) =>
    (file.length ?? 0) > (largest.length ?? 0) ? file : largest
  );
};

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
          "-map",
          "0:v:0",
          "-map",
          "0:a:0?",
          "-c",
          "copy",
          "-threads",
          "1",
          "-max_muxing_queue_size",
          "256",
          "-movflags",
          "+faststart",
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

const uploadSubtitle = async ({
  movie,
  language,
  vttPath,
  downloadLink,
}: {
  movie: TMovieSchema;
  language: string;
  vttPath: string;
  downloadLink: string;
}) => {
  await minio.putObject(
    BUCKETS.SUBTITLES,
    getSubtitlePath(movie.tmdbId.toString(), language, "subtitles.vtt"),
    await fs.promises.readFile(vttPath)
  );

  await prisma.subtitle.upsert({
    where: { downloadLink },
    update: {},
    create: {
      movieId: movie.id,
      language,
      rating: 5,
      downloadLink,
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
};

const handleSidecarSubtitleFile = async (
  movie: TMovieSchema,
  subtitleFile: { name: string }
) => {
  const target = path.resolve(
    process.cwd(),
    `./downloads-transmission/incomplete/${subtitleFile.name}`
  );
  hypertubeLogger.info(
    `Waiting for sidecar subtitle file to be downloaded ${target}`
  );
  await waitFile(target, WAIT_SUBTITLE_TIMEOUT);

  const language = formatSidecarSubtitleLanguage(subtitleFile.name);
  const subtitleDir = `/downloads-transmission/${movie.tmdbId}/subtitles/${language}`;
  const vttPath = `${subtitleDir}/subtitles.vtt`;

  hypertubeLogger.info(`Converting sidecar subtitle to VTT at ${vttPath}`);
  await fs.promises.mkdir(subtitleDir, { recursive: true });
  await convertSubtitleFileToVtt(target, vttPath);

  await uploadSubtitle({
    movie,
    language,
    vttPath,
    downloadLink: subtitleFile.name,
  });
};

export const downloadMovie = async (job: Job<TDownloadJobData>) => {
  const { movie, resolutionId } = job.data;

  const dbResolution = await prisma.resolution.findUnique({
    where: { id: resolutionId },
  });
  if (!dbResolution) {
    throw new Error(`Resolution ${resolutionId} not found`);
  }

  const resolutionStream = await minio.getObject(
    BUCKETS.MOVIES,
    getMoviePath(movie.tmdbId.toString(), resolutionId, "resolution.torrent")
  );
  const torrentBuf = await buffer(resolutionStream);
  const isMagnet = torrentBuf.toString("utf-8").startsWith("magnet:");

  const downloadDir = `/downloads-transmission/${movie.tmdbId}/resolutions/${resolutionId}`;
  await fs.promises.mkdir(downloadDir, { recursive: true });
  hypertubeLogger.info(
    `Adding ${isMagnet ? "magnet" : "torrent"} for movie ${movie.tmdbId} resolution ${dbResolution.resolution} (${dbResolution.indexerName})`
  );

  const addOptions = { "download-dir": downloadDir, paused: true };
  const result = isMagnet
    ? await downloader.addMagnet(torrentBuf.toString("utf-8"), addOptions)
    : await downloader.addTorrentMetainfo(torrentBuf, addOptions);
  hypertubeLogger.info(`Torrent added with ID: ${result.id}`);

  try {
    let files: { name: string }[];
    if (isMagnet) {
      hypertubeLogger.info("Waiting for magnet metadata");
      await downloader.start(result.id);
      files = await downloader.waitForFiles(result.id);
    } else {
      const info = await downloader.get(result.id, ["files"]);
      files = info.torrents[0].files as { name: string }[];
    }

    const videoFile = findMainVideoFile(files);
    if (!videoFile) {
      throw new Error(
        `Video file not found (supported: ${VIDEO_EXTENSIONS.join(", ")})`
      );
    }
    hypertubeLogger.info(`Video file found ${videoFile.name}`);
    const sidecarSubtitleFiles = files.filter((file) =>
      isSidecarSubtitle(file.name)
    );
    if (sidecarSubtitleFiles.length > 0) {
      hypertubeLogger.info(
        `${sidecarSubtitleFiles.length} sidecar subtitle file(s) found ${sidecarSubtitleFiles
          .map((file) => file.name)
          .join(", ")}`
      );
    }

    if (!isMagnet) {
      await downloader.start(result.id);
    }

    const target = `/downloads-transmission/incomplete/${videoFile.name}`;

    hypertubeLogger.info(`Waiting for torrent download to start (${target})`);
    await downloader.waitForDownloadProgress(result.id);

    try {
      const sidecarPromises = sidecarSubtitleFiles.map((subtitleFile) =>
        handleSidecarSubtitleFile(movie, subtitleFile)
      );
      await Promise.allSettled(sidecarPromises);
    } catch (error) {
      hypertubeLogger.error(
        `Error handling sidecar subtitle files: ${formatUnknownError(error)}`
      );
    }

    await prisma.resolution.update({
      where: {
        id: resolutionId,
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

          if (isTorrentStalled(torrent)) {
            clearInterval(intervalId);
            reject(
              new Error(
                `Torrent stalled at ${(torrent.percentDone * 100).toFixed(2)}% (${torrent.errorString ?? "no error"})`
              )
            );
            return;
          }

          if (isTorrentComplete(torrent)) {
            clearInterval(intervalId);

            const endFile = downloadDir + "/" + videoFile.name;
            await waitFile(endFile, WAIT_FILE_TIMEOUT);

            const endFileStat = await fs.promises.stat(endFile);
            if (endFileStat.size === 0) {
              reject(new Error(`Downloaded file is empty: ${endFile}`));
              return;
            }

            const moviePath = downloadDir + "/movie.mp4";

            try {
              const subtitlesDir = `/downloads-transmission/${movie.tmdbId}/subtitles`;

              await convertMovie({ path: endFile }, { path: moviePath });
              await Promise.allSettled([
                handleEmbeddedSubtitles({
                  videoPath: endFile,
                  videoFileName: videoFile.name,
                  subtitlesDir,
                  onSubtitle: async ({ language, vttPath, downloadLink }) => {
                    await uploadSubtitle({
                      movie,
                      language,
                      vttPath,
                      downloadLink,
                    });
                  },
                }),
              ]);

              const movieStat = await fs.promises.stat(moviePath);
              if (movieStat.size === 0) {
                throw new Error(`Converted movie file is empty: ${moviePath}`);
              }
              await minio.putObject(
                BUCKETS.MOVIES,
                getMoviePath(movie.tmdbId.toString(), resolutionId, "movie.mp4"),
                fs.createReadStream(moviePath),
                movieStat.size
              );

              await fs.promises.rm(downloadDir, {
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
    throw error instanceof Error
      ? error
      : new Error(formatUnknownError(error));
  }
};
