import type { Movie, Subtitle } from "@prisma/client";
import fs from "fs";
import { getMovieFolderPath } from "./movie";

const subtitleFolderName = "subtitles";
const subtitleFilename = "subtitles.zip";

export const getSubtitlePath = (
  movieId: Movie["id"],
  language: Subtitle["language"],
  withFilename: boolean = false
) => {
  return `${getMovieFolderPath(movieId)}/${subtitleFolderName}/${language}${
    withFilename ? `/${subtitleFilename}` : ""
  }`;
};

export const createSubtitle = async (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });
};

export const deleteSubtitle = async (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  const subtitleFolderPath = getSubtitlePath(movieId, language);
  await fs.promises.rm(subtitleFolderPath, { recursive: true });
};
