import * as fs from "fs";
import path from "path";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";

export const getMovieFolderPath = (movieId: TMovieSchema["tmdbId"]) => {
  return path.resolve(process.cwd(), `./downloads/${movieId}`);
};

export const createMovieFolder = async (movieId: TMovieSchema["tmdbId"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.mkdir(movieFolderPath, { recursive: true });
};

export const deleteMovieFolder = async (movieId: TMovieSchema["tmdbId"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.rm(movieFolderPath, { recursive: true });
};
