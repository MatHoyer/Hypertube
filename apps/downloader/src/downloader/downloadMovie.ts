import { DownloadStates, hypertubeLogger } from "@hypertube/libs";
import {
  getResolutionPath,
  prisma,
  renameFile,
  TDownloadJobData,
  waitFile,
} from "@hypertube/server-core";
import { Job } from "bullmq";
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

const defaultMovieName = "movie.mp4";

export const downloadMovie = async (job: Job<TDownloadJobData>) => {
  const { movie, resolution } = job.data;
  const resolutionPath = `/downloads/${movie.tmdbId}/resolutions/${resolution}/resolution.torrent`;

  hypertubeLogger.info(`Downloading movie ${resolutionPath}`);

  const result = await downloader.addFile(resolutionPath, {
    "download-dir": `/downloads/${movie.tmdbId}/resolutions/${resolution}`,
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

    await downloader.start(result.id);

    const target = path.resolve(
      process.cwd(),
      `./downloads/incomplete/${mp4File.name}.part`
    );

    hypertubeLogger.info(`Waiting for file to be downloaded ${target}`);
    await waitFile(target, 100000);

    const linkPath = path.join(
      getResolutionPath(movie.tmdbId, resolution),
      `/${defaultMovieName}`
    );
    try {
      await fs.promises.rm(linkPath, { recursive: true, force: true });
      await fs.promises.symlink(target, linkPath, "file");
    } catch (error) {
      hypertubeLogger.error(`Error symlinking movie ${error}`);
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
            const mp4Path = path.join(
              getResolutionPath(movie.tmdbId, resolution),
              mp4File.name
            );
            await waitFile(mp4Path);
            renameFile(mp4Path, `../${defaultMovieName}`);
            await fs.promises.rm(
              getResolutionPath(movie.tmdbId, resolution) +
                "/" +
                mp4File.name.split("/")[0],
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
        } catch (error) {
          reject(new Error(`Error in ending download: ${error}`));
        }
      }, 30000);
    });
  } catch (error) {
    await downloader.remove(result.id);
  }
};
