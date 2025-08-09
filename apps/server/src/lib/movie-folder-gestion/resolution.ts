import type { Movie, Prisma, Resolution } from "@prisma/client";
import fs from "fs";
import prisma from "../prisma";
import { getMovieFolderPath } from "./movie";

export const createResolution = async (
  resolutionData: Prisma.ResolutionCreateInput
) => {
  const resolution = await prisma.resolution.upsert({
    where: {
      movieId_resolution: {
        movieId: resolutionData.Movie?.connect?.id!,
        resolution: resolutionData.resolution,
      },
    },
    update: resolutionData,
    create: resolutionData,
  });

  const resolutionFolderPath = getResolutionFolderPath(
    resolution.movieId!,
    resolution.resolution
  );
  await fs.promises.mkdir(resolutionFolderPath, {
    recursive: true,
  });

  return resolution;
};

export const deleteResolution = async (resolutionId: Resolution["id"]) => {
  const resolution = await prisma.resolution.delete({
    where: {
      id: resolutionId,
    },
  });

  const resolutionFolderPath = getResolutionFolderPath(
    resolution.movieId!,
    resolution.resolution
  );
  await fs.promises.rm(resolutionFolderPath, { recursive: true });

  return resolution;
};

export const getResolutionFolderPath = (
  movieId: Movie["id"],
  resolution: Resolution["resolution"]
) => {
  return `${getMovieFolderPath(movieId)}/resolutions/${resolution}`;
};
