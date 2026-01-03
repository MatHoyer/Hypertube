import type { TMovieSchema, TResolutionSchema } from "@hypertube/libs";
import * as fs from "fs";
import { getMovieFolderPath } from "./movie.js";

const resolutionFolderName = "resolutions";

type TResolutionPathParams = {
  movieId: TMovieSchema["tmdbId"];
  resolution: TResolutionSchema["resolution"];
  forTransmission: boolean;
};

export const getResolutionPath = ({
  movieId,
  resolution,
  forTransmission,
  filename,
}: TResolutionPathParams & {
  filename?: "resolution.torrent" | "movie.mp4" | (string & {});
}) => {
  return `${getMovieFolderPath({
    movieId,
    forTransmission,
  })}/${resolutionFolderName}/${resolution}${filename ? `/${filename}` : ""}`;
};

export const createResolution = async ({
  movieId,
  resolution,
  forTransmission,
}: TResolutionPathParams) => {
  const resolutionFolderPath = getResolutionPath({
    movieId,
    resolution,
    forTransmission,
  });
  await fs.promises.mkdir(resolutionFolderPath, {
    recursive: true,
  });
};

export const deleteResolution = async ({
  movieId,
  resolution,
  forTransmission,
}: TResolutionPathParams) => {
  const resolutionFolderPath = getResolutionPath({
    movieId,
    resolution,
    forTransmission,
  });
  await fs.promises.rm(resolutionFolderPath, { recursive: true });
};
