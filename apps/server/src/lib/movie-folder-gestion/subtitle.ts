import type { Movie, Prisma, Subtitle } from "@prisma/client";
import fs from "fs";
import prisma from "../prisma";
import { getMovieFolderPath } from "./movie";

export const createSubtitle = async (
  subtitleData: Prisma.SubtitleCreateInput
) => {
  const subtitle = await prisma.subtitle.create({
    data: {
      ...subtitleData,
    },
  });
  if (!subtitle || !subtitle.movieId) {
    throw new Error("Failed to create subtitle");
  }

  const subtitleFolderPath = getSubtitleFolderPath(
    subtitle.movieId,
    subtitle.language
  );
  await fs.promises.mkdir(subtitleFolderPath, {
    recursive: true,
  });

  return subtitle;
};

export const deleteSubtitle = async (subtitleId: Subtitle["id"]) => {
  const subtitle = await prisma.subtitle.delete({
    where: { id: subtitleId },
  });
  if (!subtitle || !subtitle.movieId) {
    throw new Error("Failed to delete subtitle");
  }

  const subtitleFolderPath = getSubtitleFolderPath(
    subtitle.movieId,
    subtitle.language
  );
  await fs.promises.rm(subtitleFolderPath, { recursive: true });

  return subtitle;
};

export const getSubtitleFolderPath = (
  movieId: Movie["id"],
  language: Subtitle["language"]
) => {
  return `${getMovieFolderPath(movieId)}/subtitles/${language}`;
};
