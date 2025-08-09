import type { Movie, Prisma } from "@prisma/client";
import fs from "fs";
import prisma from "../prisma";

export const createMovie = async (movieData: Prisma.MovieCreateInput) => {
  const movie = await prisma.movie.upsert({
    where: {
      link: movieData.link,
    },
    update: movieData,
    create: movieData,
  });

  const movieFolderPath = getMovieFolderPath(movie.id);
  await fs.promises.mkdir(movieFolderPath, { recursive: true });

  return movie;
};

export const deleteMovie = async (movieId: Movie["id"]) => {
  const movie = await prisma.movie.delete({
    where: {
      id: movieId,
    },
  });

  const movieFolderPath = getMovieFolderPath(movie.id);
  await fs.promises.rm(movieFolderPath, { recursive: true });

  return movie;
};

export const getMovieFolderPath = (movieId: Movie["id"]) => {
  return `./downloads/${movieId}`;
};
