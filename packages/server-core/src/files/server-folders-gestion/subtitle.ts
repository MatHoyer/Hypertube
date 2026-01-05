import type { TMovieSchema, TSubtitleSchema } from "@hypertube/libs";
import * as fs from "fs";
import { getMovieFolderPath } from "./movie.js";

const subtitleFolderName = "subtitles";

type TSubtitlePathParams = {
  movieId: TMovieSchema["tmdbId"];
  language: TSubtitleSchema["language"];
};

export const getSubtitlePath = ({
  movieId,
  language,
  filename,
}: TSubtitlePathParams & { filename?: "subtitles.vtt" | (string & {}) }) => {
  return `${getMovieFolderPath({
    movieId,
    forTransmission: false,
  })}/${subtitleFolderName}/${language}${filename ? `/${filename}` : ""}`;
};

export const createSubtitle = async ({
  movieId,
  language,
}: TSubtitlePathParams) => {
  const subtitleFolderPath = getSubtitlePath({ movieId, language });
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });
};

export const deleteSubtitle = async ({
  movieId,
  language,
}: TSubtitlePathParams) => {
  const subtitleFolderPath = getSubtitlePath({ movieId, language });
  await fs.promises.rm(subtitleFolderPath, { recursive: true });
};
