import { DownloadStates, hypertubeLogger } from "@hypertube/libs";
import { prisma } from "../src/index.js";
import notificationsData from "./seed/notifications.json";

const createDefaultMovie = async () => {
  const movieId = "00000000-0000-0000-0000-000000000000";

  const movie = await prisma.movie.upsert({
    where: {
      tmdbId: 0,
    },
    update: {
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

const createNotifications = async () => {
  const alreadyExistingNotifications = await prisma.notification.findFirst();
  if (alreadyExistingNotifications) {
    hypertubeLogger.info("Notifications already exist, skipping creation");
    return;
  }

  await prisma.notification.createMany({
    data: notificationsData,
  });
};

const main = async () => {
  try {
    hypertubeLogger.info("Starting seed...");
    await createDefaultMovie();
    await createNotifications();
    hypertubeLogger.info("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    hypertubeLogger.error(`Seed failed: ${error}`);
    process.exit(1);
  }
};

main();
