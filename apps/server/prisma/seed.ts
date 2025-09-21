import { DownloadStates } from "@hypertube/libs";
import { v4 } from "uuid";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

const createDefaultUser = async () => {
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash("p");

  const userData = {
    id: v4(),
    username: "test",
    email: "test@test.com",
    name: "Test User",
    firstName: "Test",
    lastName: "User",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const user = await prisma.user.upsert({
    where: {
      email: "test@test.com",
    },
    update: userData,
    create: userData,
  });

  const accountData = {
    id: v4(),
    accountId: v4(),
    providerId: "credential",
    userId: user.id,
    accessToken: "test",
    refreshToken: "test",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: accountData.providerId,
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: accountData,
    });
  } else {
    await prisma.account.create({
      data: accountData,
    });
  }
};

const createDefaultMovie = async () => {
  const movieId = "00000000-0000-0000-0000-000000000000";

  const movieData = {
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
  };
  const movie = await prisma.movie.upsert({
    where: {
      id: movieId,
    },
    update: movieData,
    create: movieData,
  });

  const resolutionData = {
    movieId: movie.id,
    resolution: "720p",
    size: "Many GB",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.resolution.upsert({
    where: {
      movieId_resolution: {
        movieId: movie.id,
        resolution: resolutionData.resolution,
      },
    },
    update: resolutionData,
    create: resolutionData,
  });

  const subtitleDataFrench = {
    movieId: movie.id,
    language: "fr",
    rating: 5,
    downloadLink: "https://example.com/fr",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.subtitle.upsert({
    where: {
      downloadLink: subtitleDataFrench.downloadLink,
    },
    update: subtitleDataFrench,
    create: subtitleDataFrench,
  });

  const subtitleDataEnglish = {
    movieId: movie.id,
    language: "en",
    rating: 5,
    downloadLink: "https://example.com/en",
    downloadState: DownloadStates.DOWNLOADED,
  };
  await prisma.subtitle.upsert({
    where: {
      downloadLink: subtitleDataEnglish.downloadLink,
    },
    update: subtitleDataEnglish,
    create: subtitleDataEnglish,
  });
};

const main = async () => {
  await createDefaultUser();
  await createDefaultMovie();
};

main();
