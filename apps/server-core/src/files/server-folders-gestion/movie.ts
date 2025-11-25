import type { TMovieSchema } from "@hypertube/libs";
import * as fs from "fs";
import path from "path";

type TMovieFolderPathParams = {
  movieId: TMovieSchema["tmdbId"];
  forTransmission: boolean;
};

export const getMovieFolderPath = ({
  movieId,
  forTransmission,
}: TMovieFolderPathParams) => {
  return path.resolve(
    process.cwd(),
    `./downloads${forTransmission ? "-transmission" : ""}/${movieId}`,
  );
};

export const createMovieFolder = async ({
  movieId,
  forTransmission,
}: TMovieFolderPathParams) => {
  const movieFolderPath = getMovieFolderPath({ movieId, forTransmission });
  await fs.promises.mkdir(movieFolderPath, { recursive: true });
};

export const deleteMovieFolder = async ({
  movieId,
  forTransmission,
}: TMovieFolderPathParams) => {
  const movieFolderPath = getMovieFolderPath({ movieId, forTransmission });
  await fs.promises.rm(movieFolderPath, { recursive: true });
};
