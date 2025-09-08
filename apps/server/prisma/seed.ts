import { DownloadStates } from "@hypertube/libs";
import { v4 } from "uuid";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

const createDefaultUser = async () => {
  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email: "test@test.com",
    },
  });
  if (userAlreadyExists) return;

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash("p");
  const user = await prisma.user.create({
    data: {
      id: v4(),
      username: "test",
      email: "test@test.com",
      name: "Test User",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  await prisma.account.create({
    data: {
      id: v4(),
      accountId: v4(),
      providerId: "credential",
      userId: user.id,
      accessToken: "test",
      refreshToken: "test",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
};

const createDefaultMovie = async () => {
  const movieId = "00000000-0000-0000-0000-000000000000";

  const movieAlreadyExists = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });
  if (movieAlreadyExists) return;

  const movie = await prisma.movie.create({
    data: {
      id: movieId,
      title: "viens, on recode Bitcoin de zéro pour le comprendre",
      description: null,
      imdbId: "some imdb id",
      year: 2025,
      rating: 10,
      genres: [],
      language: "fr",
      ytTrailerCode: "U4S-RGNyTJA",
      backgroundImageUrl:
        "https://yts.mx/assets/images/movies/instintos_2025/background.jpg",
      smallCoverImageUrl:
        "https://yts.mx/assets/images/movies/instintos_2025/small-cover.jpg",
      mediumCoverImageUrl:
        "https://yts.mx/assets/images/movies/instintos_2025/medium-cover.jpg",
      largeCoverImageUrl:
        "https://yts.mx/assets/images/movies/instintos_2025/large-cover.jpg",
      additionalInfoFetched: true,
      demoMovie: true,
    },
  });

  await prisma.resolution.create({
    data: {
      movieId: movie.id,
      resolution: "720p",
      size: "Many GB",
      downloadState: DownloadStates.DOWNLOADED,
    },
  });

  await prisma.subtitle.create({
    data: {
      movieId: movie.id,
      language: "fr",
      rating: 5,
      downloadLink: "https://example.com/fr",
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
  await prisma.subtitle.create({
    data: {
      movieId: movie.id,
      language: "en",
      rating: 5,
      downloadLink: "https://example.com/en",
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
};

const main = async () => {
  await createDefaultUser();
  await createDefaultMovie();
};

main();
