import type { TMovieSchema } from "@hypertube/libs";
import {
  getResolutionPath,
  renameFile,
  TResolutionSchema,
  waitFile,
} from "@hypertube/libs";
import * as fs from "fs";
import path from "path";
import { notifyServer } from "../notifyServer.js";
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

export const downloadMovie = async (
  movie: TMovieSchema,
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionPath = `/downloads/${movie.tmdbId}/resolutions/${resolution}/resolution.torrent`;

  console.log("Downloading movie", resolutionPath);

  try {
    const result = await downloader.addFile(resolutionPath, {
      "download-dir": `/downloads/${movie.tmdbId}/resolutions/${resolution}`,
      paused: true,
    });
    console.log("Torrent added with ID:", result.id);

    const info = await downloader.get(result.id, ["files"]);
    const files = info.torrents[0].files as { name: string }[];

    const mp4File = files.find((file) => file.name.endsWith(".mp4"));
    if (!mp4File) {
      throw new Error("MP4 file not found");
    }
    console.log("MP4 file found", mp4File.name);

    await downloader.start(result.id);

    const target = path.resolve(
      process.cwd(),
      `./downloads/incomplete/${mp4File.name}.part`
    );

    console.log("Waiting for file to be downloaded", target);
    await waitFile(target, 60000);

    const linkPath = path.join(
      getResolutionPath(movie.tmdbId, resolution),
      `/${defaultMovieName}`
    );
    try {
      await fs.promises.rm(linkPath, { recursive: true, force: true });
      await fs.promises.symlink(target, linkPath, "file");
    } catch (error) {
      console.error("Error symlinking movie", error);
    }

    const interval = setInterval(async () => {
      const res = await downloader.get(result.id);
      const torrent = res.torrents[0];
      if (!torrent) clearInterval(interval);

      const name = torrent.name;
      const percentDone = (torrent.percentDone * 100).toFixed(2);
      const downloadSpeed = (torrent.rateDownload / 1024).toFixed(2); // Ko/s
      const status = torrent.status;

      if (status === Status.SEEDING || status === Status.STOPPED) {
        clearInterval(interval);

        try {
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

          await notifyServer({
            type: "ended",
            movieId: movie.id,
            resolution: resolution,
            success: true,
          });
        } catch (err) {
          await notifyServer({
            type: "ended",
            movieId: movie.id,
            resolution: resolution,
            success: false,
          });
        }
      }

      console.log("Name", name);
      console.log("Percent done", percentDone);
      console.log("Download speed", downloadSpeed);
      console.log("Status", status);
    }, 1000);
  } catch (err) {
    console.error("Error adding torrent:", err);
  }
};
