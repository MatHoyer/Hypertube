import type { TMovieSchema } from "@hypertube/libs";
import * as fs from "fs";
import path from "path";

export const getMovieFolderPath = (movieId: TMovieSchema["id"]) => {
  return path.resolve(process.cwd(), `./downloads/${movieId}`);
};

export const createMovieFolder = async (movieId: TMovieSchema["id"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.mkdir(movieFolderPath, { recursive: true });
};

export const deleteMovieFolder = async (movieId: TMovieSchema["id"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.rm(movieFolderPath, { recursive: true });
};
