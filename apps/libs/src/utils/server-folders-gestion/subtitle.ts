import * as fs from "fs";
import type {
  TMovieSchema,
  TSubtitleSchema,
} from "../../schemas/database/movie.schema.js";
import { getMovieFolderPath } from "./movie.js";

const subtitleFolderName = "subtitles";
const subtitleFilename = "subtitles.vtt";

export const getSubtitlePath = (
  movieId: TMovieSchema["tmdbId"],
  language: TSubtitleSchema["language"],
  withFilename: boolean = false
) => {
  return `${getMovieFolderPath(movieId)}/${subtitleFolderName}/${language}${
    withFilename ? `/${subtitleFilename}` : ""
  }`;
};

export const createSubtitle = async (
  movieId: TMovieSchema["tmdbId"],
  language: TSubtitleSchema["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });
};

export const deleteSubtitle = async (
  movieId: TMovieSchema["tmdbId"],
  language: TSubtitleSchema["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.rm(subtitleFolderPath, { recursive: true });
};
