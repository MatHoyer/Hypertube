import { DownloadStates, hypertubeLogger, TMovieSchema } from "@hypertube/libs";
import {
  convertSrtToVtt,
  getResolutionPath,
  getSubtitlePath,
  prisma,
  renameFile,
  TDownloadJobData,
  waitFile,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import path from "path";
import { Readable } from "stream";
import { notifySubscribers } from "../notifications/notifySubscriber.js";
import { downloader } from "./downloader.js";

const Status = {
  STOPPED: 0,
  CHECK_WAIT: 1,
  CHECKING: 2,
  DOWNLOAD_WAIT: 3,
  DOWNLOADING: 4,
  SEED_WAIT: 5,
  SEEDING: 6,
} as const;

const defaultMovieName = "movie.mp4";

const convertWhileDownloading = (
  input: {
    stream: Readable;
    extension: string;
  },
  output: {
    path: string;
  },
  handler?: {
    onStart?: () => void;
    onProgress?: (progress: { percent: number }) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  const outputStream = fs.createWriteStream(output.path);

  ffmpeg(input.stream)
    .inputFormat(input.extension)
    .output(outputStream)
    .inputOptions(["-fflags +genpts"])
    .outputOptions(["-c copy"])
    .on("start", () => {
      hypertubeLogger.info(`Conversion started`);
      handler?.onStart?.();
    })
    .on("progress", (progress) => {
      hypertubeLogger.info(
        `Conversion progress: ${progress.percent?.toFixed(2) || 0}%`
      );
      handler?.onProgress?.({ percent: progress.percent || 0 });
    })
    .on("end", () => {
      hypertubeLogger.info(`Conversion ended`);
      handler?.onEnd?.();
    })
    .on("error", (error) => {
      hypertubeLogger.error(`Conversion error: ${error}`);
      handler?.onError?.(error);
    })
    .run();
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
  await waitFile(target, 100000);
  let language = srtFile.name.substring(
    srtFile.name.lastIndexOf("/") + 1,
    srtFile.name.lastIndexOf(".")
  );
  if (language.includes("[YTS.MX]")) {
    language = "YTS OFFICIAL - English";
  } else {
    language = "YTS - " + language;
  }

  const srtPath = path.join(
    getSubtitlePath(movie.tmdbId, language),
    "subtitles.srt"
  );
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

    hypertubeLogger.info(`Waiting for file to be downloaded ${target}`);
    await waitFile(target, 1000000);

    const linkPath = path.join(
      getResolutionPath(movie.tmdbId, resolution, true),
      mp4File.name
    );
    try {
      // We remove the old symlink/file and create a new one
      const dir = path.dirname(linkPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.rm(linkPath, { recursive: true, force: true });
      await fs.promises.symlink(target, linkPath, "file");
    } catch (error) {
      hypertubeLogger.error(`Error symlinking movie ${error}`);
    }

    try {
      const srtPromises = srtFiles.map((srtFile) =>
        handleSrtFile(movie, srtFile)
      );
      await Promise.allSettled(srtPromises);
    } catch (error) {
      hypertubeLogger.error(`Error handling SRT files ${error}`);
    }

    await prisma.resolution.update({
      where: {
        movieId_resolution: {
          movieId: movie.id,
          resolution: resolution,
        },
      },
      data: {
        downloadState: DownloadStates.DOWNLOADING,
      },
    });
    try {
      await notifySubscribers(movie.id, DownloadStates.DOWNLOADING);
    } catch (error) {
      hypertubeLogger.error(
        `Error sending movie downloading notification: ${error}`
      );
    }
    job.updateProgress(0);
    let isConverting = false;

    hypertubeLogger.info(`Movie downloaded started successfully`);
    return new Promise<void>((resolve, reject) => {
      setInterval(async () => {
        try {
          const res = await downloader.get(result.id);
          const torrent = res.torrents[0];
          if (!torrent) reject(new Error("Torrent not found"));

          const name = torrent.name;
          const percentDone = torrent.percentDone * 100;
          const downloadSpeed = torrent.rateDownload / 1024; // Ko/s
          const status = torrent.status;

          if (status === Status.SEEDING || status === Status.STOPPED) {
            // We wait for transmission to put the file in the correct folder
            // then we keep the mp4 file, we rename it and remove the others
            const mp4Path = path.join(
              getResolutionPath(movie.tmdbId, resolution, true),
              mp4File.name
            );
            await waitFile(mp4Path);
            renameFile(mp4Path, `../${defaultMovieName}`);
            await fs.promises.rm(
              path.join(
                getResolutionPath(movie.tmdbId, resolution, true),
                mp4File.name.split("/")[0]
              ),
              {
                recursive: true,
                force: true,
              }
            );

            resolve();
          }

          hypertubeLogger.info(
            `Name: ${name}, Percent done: ${percentDone.toFixed(
              2
            )}, Download speed: ${downloadSpeed.toFixed(2)}, Status: ${status}`
          );
          job.updateProgress(percentDone);

          if (!isConverting && percentDone > 25) {
            isConverting = true;
            try {
              convertWhileDownloading(
                {
                  stream: fs.createReadStream(linkPath),
                  extension: mp4File.name.split(".").pop() || "mp4",
                },
                {
                  path: getResolutionPath(
                    movie.tmdbId,
                    resolution,
                    false,
                    "movie.mp4"
                  ),
                }
              );
            } catch (error) {
              hypertubeLogger.error(`Error converting movie ${error}`);
              isConverting = false;
            }
          }
        } catch (error) {
          reject(new Error(`Error in ending download: ${error}`));
        }
      }, 30000);
    });
  } catch (error) {
    await downloader.remove(result.id);
  }
};
