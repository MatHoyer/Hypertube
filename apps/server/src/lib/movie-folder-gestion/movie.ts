import type { Movie } from "@prisma/client";
import fs from "fs";

export const createMovieFolder = async (movieId: Movie["id"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.mkdir(movieFolderPath, { recursive: true });
};

export const deleteMovieFolder = async (movieId: Movie["id"]) => {
  const movieFolderPath = getMovieFolderPath(movieId);
  await fs.promises.rm(movieFolderPath, { recursive: true });
};

export const getMovieFolderPath = (movieId: Movie["id"]) => {
  return `./downloads/${movieId}`;
};
