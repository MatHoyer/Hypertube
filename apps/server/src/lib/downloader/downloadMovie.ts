import type { TMovieSchema } from "@hypertube/libs";
import { DownloadStates, TResolutionSchema } from "@hypertube/libs";
import * as fs from "fs";
import path from "path";
import { getResolutionPath } from "../movie-folder-gestion/resolution";
import { renameFile, waitFile } from "../movie-folder-gestion/utils";
import prisma from "../prisma";
import { downloader } from "./downloader";

const Status = {
  STOPPED: 0,
  CHECK_WAIT: 1,
  CHECKING: 2,
  DOWNLOAD_WAIT: 3,
  DOWNLOADING: 4,
  SEED_WAIT: 5,
  SEEDING: 6,
} as const;

export const downloadMovie = async (
  movieId: TMovieSchema["id"],
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionPath = getResolutionPath(movieId, resolution, true).slice(1);

  console.log("Downloading movie", resolutionPath);

  try {
    const result = await downloader.addFile(resolutionPath, {
      "download-dir": getResolutionPath(movieId, resolution).slice(1),
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
            getResolutionPath(movieId, resolution),
            mp4File.name
          );
          await waitFile(mp4Path);
          renameFile(mp4Path, "../movie.mp4");
          await fs.promises.rm(
            getResolutionPath(movieId, resolution) +
              "/" +
              mp4File.name.split("/")[0],
            {
              recursive: true,
              force: true,
            }
          );

          await prisma.resolution.update({
            where: {
              movieId_resolution: {
                movieId: movieId,
                resolution: resolution,
              },
            },
            data: {
              downloadState: DownloadStates.DOWNLOADED,
            },
          });
        } catch (err) {
          console.error("Error downloading movie", err);
          await prisma.resolution.update({
            where: {
              movieId_resolution: {
                movieId: movieId,
                resolution: resolution,
              },
            },
            data: {
              downloadState: DownloadStates.NOT_DOWNLOADED,
            },
          });
        }
      }

      console.log("Name", name);
      console.log("Percent done", percentDone);
      console.log("Download speed", downloadSpeed);
      console.log("Status", status);
    }, 1000);

    await downloader.start(result.id);
  } catch (err) {
    console.error("Error adding torrent:", err);
  }
};
