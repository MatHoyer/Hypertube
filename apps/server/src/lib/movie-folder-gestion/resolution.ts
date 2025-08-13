import type { Movie, Resolution } from "@prisma/client";
import fs from "fs";
import { getMovieFolderPath } from "./movie";

const resolutionFolderName = "resolutions";
const resolutionFilename = "resolution.torrent";

export const getResolutionPath = (
  movieId: Movie["id"],
  resolution: Resolution["resolution"],
  withFilename: boolean = false
) => {
  return `${getMovieFolderPath(movieId)}/${resolutionFolderName}/${resolution}${
    withFilename ? `/${resolutionFilename}` : ""
  }`;
};

export const createResolution = async (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  const resolutionFolderPath = getResolutionPath(movieId, resolution);
  await fs.promises.mkdir(resolutionFolderPath, {
    recursive: true,
  });
};

export const deleteResolution = async (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  const resolutionFolderPath = getResolutionPath(movieId, resolution);
  await fs.promises.rm(resolutionFolderPath, { recursive: true });
};
