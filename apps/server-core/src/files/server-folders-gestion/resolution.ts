import type { TMovieSchema, TResolutionSchema } from "@hypertube/libs";
import * as fs from "fs";
import { getMovieFolderPath } from "./movie.js";

const resolutionFolderName = "resolutions";

export const getResolutionPath = (
  movieId: TMovieSchema["tmdbId"],
  resolution: TResolutionSchema["resolution"],
  type?: "resolution.torrent" | "movie.mp4"
) => {
  return `${getMovieFolderPath(movieId)}/${resolutionFolderName}/${resolution}${
    type ? `/${type}` : ""
  }`;
};

export const createResolution = async (
  movieId: TMovieSchema["tmdbId"],
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionFolderPath = getResolutionPath(movieId, resolution);
  await fs.promises.mkdir(resolutionFolderPath, {
    recursive: true,
  });
};

export const deleteResolution = async (
  movieId: TMovieSchema["tmdbId"],
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionFolderPath = getResolutionPath(movieId, resolution);
  await fs.promises.rm(resolutionFolderPath, { recursive: true });
};
