import type { TMovieSchema } from "@hypertube/libs";
import { TResolutionSchema } from "@hypertube/libs";
import { getResolutionPath } from "../movie-folder-gestion/resolution";
import { downloader } from "./downloader";

export const downloadMovie = async (
  movieId: TMovieSchema["id"],
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionPath = getResolutionPath(movieId, resolution, true).slice(1);

  console.log("Downloading movie", resolutionPath);

  try {
    const result = await downloader.addFile(resolutionPath, {
      "download-dir": "/downloads",
    });
    console.log("Torrent added with ID:", result.id);
  } catch (err) {
    console.error("Error adding torrent:", err);
  }
};
