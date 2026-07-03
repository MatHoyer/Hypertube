import { hypertubeLogger } from "@hypertube/libs";
import { env, MOVIE_QUEUE, TDownloadJobData } from "@hypertube/server-core";
import { MOVIE_QUEUE_JOB_NAMES } from "@hypertube/server-core/src/redis/const.js";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import {
  downloadMovieFailureHandler,
  downloadMovieHandler,
  downloadMovieSuccessHandler,
} from "./handlers/movie/download-movie.handler.js";
import { gracefulShutdown } from "./shutdown.js";

const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const worker = new Worker<TDownloadJobData>(
  MOVIE_QUEUE,
  async (job: Job) => {
    switch (job.name) {
      case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
        return downloadMovieHandler(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  { connection, concurrency: 5, lockDuration: 3600000 }
);

hypertubeLogger.info(`Downloader worker started`);

// Handle graceful shutdown
process
  .on("SIGINT", () => gracefulShutdown("SIGINT", worker))
  .on("SIGTERM", () => gracefulShutdown("SIGTERM", worker));

// Handle completed jobs
worker.on("completed", async (job) => {
  switch (job.name) {
    case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
      return downloadMovieSuccessHandler(job);
    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
});

worker.on("failed", async (job, err) => {
  if (!job) {
    hypertubeLogger.error("Job not found");
    return;
  }

  switch (job.name) {
    case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
      return downloadMovieFailureHandler(job, err);
    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
});
