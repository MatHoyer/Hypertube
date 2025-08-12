import type { Movie, Subtitle } from "@prisma/client";
import fs from "fs";
import { getMovieFolderPath } from "./movie";

export const createSubtitle = async (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  const subtitleFolderPath = getSubtitleFolderPath(movieId, language);
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });
};

export const deleteSubtitle = async (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  const subtitleFolderPath = getSubtitleFolderPath(movieId, language);
  await fs.promises.rm(subtitleFolderPath, { recursive: true });
};

export const getSubtitleFolderPath = (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  return `${getMovieFolderPath(movieId)}/subtitles/${language}`;
};

export const getSubtitleFilePath = (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  return `${getSubtitleFolderPath(movieId, language)}/subtitles.zip`;
};
