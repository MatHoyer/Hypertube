import { DownloadStates } from "@hypertube/libs";
import { prisma } from "../src/index.js";

const createDefaultMovie = async () => {
  const movieId = "00000000-0000-0000-0000-000000000000";

  const movie = await prisma.movie.upsert({
    where: {
      id: movieId,
    },
    update: {
      tmdbId: 0,
      imdbId: "tt0",
      demoMovie: true,
    },
    create: {
      tmdbId: 0,
      imdbId: "tt0",
      demoMovie: true,
    },
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
  await createDefaultMovie();
};

main();
