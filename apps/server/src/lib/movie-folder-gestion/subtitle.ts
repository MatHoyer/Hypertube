import type { TMovieSchema, TSubtitleSchema } from "@hypertube/libs";
import * as fs from "fs";
import { getMovieFolderPath } from "./movie";

const subtitleFolderName = "subtitles";
const subtitleFilename = "subtitles.zip";

export const getSubtitlePath = (
  movieId: TMovieSchema["id"],
  language: TSubtitleSchema["language"],
  withFilename: boolean = false
) => {
  return `${getMovieFolderPath(movieId)}/${subtitleFolderName}/${language}${
    withFilename ? `/${subtitleFilename}` : ""
  }`;
};

export const createSubtitle = async (
  movieId: TMovieSchema["id"],
  language: TSubtitleSchema["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });
};

export const deleteSubtitle = async (
  movieId: TMovieSchema["id"],
  language: TSubtitleSchema["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.rm(subtitleFolderPath, { recursive: true });
};
