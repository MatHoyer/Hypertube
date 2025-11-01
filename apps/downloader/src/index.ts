import { DownloadStates, hypertubeLogger } from "@hypertube/libs";
import {
  DOWNLOAD_QUEUE,
  env,
  prisma,
  TDownloadJobData,
} from "@hypertube/server-core";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import { downloadMovie } from "./downloader/downloadMovie.js";
import { notifySubscribers } from "./notifications/notifySubscribers.js";
import { gracefulShutdown } from "./shutdown.js";

const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const worker = new Worker<TDownloadJobData>(
  DOWNLOAD_QUEUE,
  async (job: Job<TDownloadJobData>) => {
    hypertubeLogger.info(`[${job.data.movie.id}] Download torrent job started`);

    return downloadMovie(job);
  },
  { connection, concurrency: 5, lockDuration: 120000 }
);

hypertubeLogger.info(`Downloader worker started`);

// Handle graceful shutdown
process
  .on("SIGINT", () => gracefulShutdown("SIGINT", worker))
  .on("SIGTERM", () => gracefulShutdown("SIGTERM", worker));

// Handle completed jobs
worker.on("completed", async (job) => {
  hypertubeLogger.info(`[${job.data.movie.id}] Moviedownload success`);

  await prisma.resolution.update({
    where: {
      movieId_resolution: {
        movieId: job.data.movie.id,
        resolution: job.data.resolution,
      },
    },
    data: {
      downloadState: DownloadStates.DOWNLOADED,
    },
  });

  try {
    await notifySubscribers(job.data.movie.id, DownloadStates.DOWNLOADED);
  } catch (error) {
    hypertubeLogger.error(
      `Error sending movie downloaded notification: ${error}`
    );
  }
});

worker.on("failed", async (job, err) => {
  hypertubeLogger.error(
    `[${job?.data.movie.id}] Movie download failed : ${JSON.stringify(err)}`
  );
  if (!job?.data.movie.id || !job?.data.resolution) {
    hypertubeLogger.error(
      `[${job?.data.movie.id}] Can't update movie resolution download state : No movieId or resolution`
    );
    return;
  }

  await prisma.resolution.update({
    where: {
      movieId_resolution: {
        movieId: job.data.movie.id,
        resolution: job.data.resolution,
      },
    },
    data: {
      downloadState: DownloadStates.NOT_DOWNLOADED,
    },
  });
});
