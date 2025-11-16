import type { TMovieSchema } from "@hypertube/libs";
import * as fs from "fs";
import path from "path";

export const getMovieFolderPath = (
  movieId: TMovieSchema["tmdbId"],
  forTransmission: boolean = false
) => {
  return path.resolve(
    process.cwd(),
    `./downloads${forTransmission ? "-transmission" : ""}/${movieId}`
  );
};

export const createMovieFolder = async (
  movieId: TMovieSchema["tmdbId"],
  forTransmission: boolean = false
) => {
  const movieFolderPath = getMovieFolderPath(movieId, forTransmission);
  await fs.promises.mkdir(movieFolderPath, { recursive: true });
};

export const deleteMovieFolder = async (
  movieId: TMovieSchema["tmdbId"],
  forTransmission: boolean = false
) => {
  const movieFolderPath = getMovieFolderPath(movieId, forTransmission);
  await fs.promises.rm(movieFolderPath, { recursive: true });
};
