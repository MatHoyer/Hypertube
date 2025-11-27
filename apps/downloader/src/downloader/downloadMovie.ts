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

const checkFileReadability = async (filePath: string) => {
  return new Promise<boolean>((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        hypertubeLogger.error(
          `File is NOT readable by ffmpeg: ${JSON.stringify(err)}`,
        );
        resolve(false);
      } else {
        hypertubeLogger.info(
          `File is readable, metadata: ${JSON.stringify(metadata.format)}`,
        );
        resolve(true);
      }
    });
  });
};

const convertWhileDownloading = async (
  input: {
    path: string;
  },
  output: {
    path: string;
  },
  handler?: {
    onStart?: () => Promise<void>;
    onProgress?: (progress: { percent: number }) => Promise<void>;
    onEnd?: () => Promise<void>;
    onError?: (error: Error) => Promise<void>;
  },
) => {
  const isReadable = await checkFileReadability(input.path);
  if (!isReadable) {
    throw new Error("File is not readable");
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
        `Conversion progress: ${progress.percent?.toFixed(2) || 0}%`,
      );
      await handler?.onProgress?.({ percent: progress.percent || 0 });
    })
    .on("end", async () => {
      hypertubeLogger.info(`Conversion ended`);
      await handler?.onEnd?.();
    })
    .on("error", async (error) => {
      hypertubeLogger.error(`Conversion error: ${error}`);
      await handler?.onError?.(error);
    })
    .run();
};

const handleSrtFile = async (
  movie: TMovieSchema,
  srtFile: { name: string },
) => {
  const target = path.resolve(
    process.cwd(),
    `./downloads-transmission/incomplete/${srtFile.name}`,
  );
  hypertubeLogger.info(`Waiting for SRT file to be downloaded ${target}`);
  await waitFile(target, 100000);
  let language = srtFile.name.substring(
    srtFile.name.lastIndexOf("/") + 1,
    srtFile.name.lastIndexOf("."),
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
          .join(", ")}`,
      );
    }

    await downloader.start(result.id);

    const target = path.resolve(
      process.cwd(),
      `./downloads-transmission/incomplete/${mp4File.name}`,
    );

    hypertubeLogger.info(`Waiting for file to be downloaded ${target}`);
    await waitFile(target, 1000000);

    const linkPath = path.join(
      getResolutionPath({
        movieId: movie.tmdbId,
        resolution,
        forTransmission: true,
      }),
      mp4File.name,
    );
    try {
      const dir = path.dirname(linkPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.rm(linkPath, { recursive: true, force: true });
      await fs.promises.symlink(target, linkPath, "file");
    } catch (error) {
      hypertubeLogger.error(`Error symlinking movie ${error}`);
    }

    try {
      const srtPromises = srtFiles.map((srtFile) =>
        handleSrtFile(movie, srtFile),
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
    job.updateProgress(0);
    let isConverting = false;
    let isFirstConversion = true;
    const replaceCurrentMovie = async () => {
      await fs.promises.rename(
        path.join(
          getResolutionPath({
            movieId: movie.tmdbId,
            resolution,
            forTransmission: false,
          }),
          "movie.converted.mp4",
        ),
        path.join(
          getResolutionPath({
            movieId: movie.tmdbId,
            resolution,
            forTransmission: false,
            filename: "movie.mp4",
          }),
        ),
      );
    };

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
            await waitFile(linkPath);

            isConverting = true;
            await convertWhileDownloading(
              {
                path: linkPath,
              },
              {
                path: path.join(
                  getResolutionPath({
                    movieId: movie.tmdbId,
                    resolution,
                    forTransmission: false,
                  }),
                  "movie.converted.mp4",
                ),
              },
              {
                onEnd: async () => {
                  await replaceCurrentMovie();
                  await fs.promises.rm(
                    `./downloads-transmission/${movie.tmdbId}`,
                    {
                      recursive: true,
                      force: true,
                    },
                  );
                },
              },
            );

            resolve();
          }

          hypertubeLogger.info(
            `Name: ${name}, Percent done: ${percentDone.toFixed(
              2,
            )}, Download speed: ${downloadSpeed.toFixed(2)}, Status: ${status}`,
          );
          job.updateProgress(percentDone);

          if (!isConverting && percentDone > 25) {
            isConverting = true;
            try {
              await convertWhileDownloading(
                {
                  path: linkPath,
                },
                {
                  path: path.join(
                    getResolutionPath({
                      movieId: movie.tmdbId,
                      resolution,
                      forTransmission: false,
                    }),
                    "movie.converted.mp4",
                  ),
                },
                {
                  onEnd: async () => {
                    await replaceCurrentMovie();
                    if (isFirstConversion) {
                      isFirstConversion = false;
                      await notifySubscribers(
                        movie.id,
                        DownloadStates.DOWNLOADING,
                      );
                    }
                  },
                },
              );
              isConverting = false;
            } catch (error) {
              hypertubeLogger.error(
                `convert on the fly: Error converting movie ${error}`,
              );
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
