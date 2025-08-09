import type { Movie, Prisma } from "@prisma/client";
import fs from "fs";
import prisma from "../prisma";

export const createMovie = async (movieData: Prisma.MovieCreateInput) => {
  const movie = await prisma.movie.create({
    data: {
      ...movieData,
    },
  });
  if (!movie) {
    throw new Error("Failed to create movie");
  }

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
  if (!movie) {
    throw new Error("Failed to delete movie");
  }

  const movieFolderPath = getMovieFolderPath(movie.id);
  await fs.promises.rm(movieFolderPath, { recursive: true });

  return movie;
};

export const getMovieFolderPath = (movieId: Movie["id"]) => {
  return `./downloads/${movieId}`;
};
