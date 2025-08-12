import type { Movie, Resolution } from "@prisma/client";
import fs from "fs";
import { getMovieFolderPath } from "./movie";

export const createResolution = async (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  const resolutionFolderPath = getResolutionFolderPath(movieId, resolution);
  await fs.promises.mkdir(resolutionFolderPath, {
    recursive: true,
  });
};

export const deleteResolution = async (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  const resolutionFolderPath = getResolutionFolderPath(movieId, resolution);
  await fs.promises.rm(resolutionFolderPath, { recursive: true });
};

export const getResolutionFolderPath = (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  return `${getMovieFolderPath(movieId)}/resolutions/${resolution}`;
};

export const getResolutionFilePath = (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  return `${getResolutionFolderPath(movieId, resolution)}/resolution.torrent`;
};
