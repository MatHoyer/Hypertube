import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import {
  env,
  IStorageService,
  MinioStorageService,
  MOVIE_QUEUE,
  MOVIE_QUEUE_JOB_NAMES,
  TDownloadJobData,
  TStopSeedingJobData,
} from "@hypertube/server-core";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import { downloadMoviePreviews } from "./handlers/movie/download-movie-previews.js";
import {
  downloadMovieFailureHandler,
  downloadMovieHandler,
  downloadMovieSuccessHandler,
} from "./handlers/movie/download-movie.handler.js";
import { reconcileSeeds } from "./handlers/movie/seed-reconciliation.js";
import { stopSeeding } from "./handlers/movie/webtorrent.client.js";
import { gracefulShutdown } from "./shutdown.js";

export const storageService: IStorageService = new MinioStorageService();

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
      case MOVIE_QUEUE_JOB_NAMES.PREVIEW_MOVIE:
        return downloadMoviePreviews(job);
      case MOVIE_QUEUE_JOB_NAMES.STOP_SEEDING:
        return stopSeeding((job.data as TStopSeedingJobData).infoHash);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  { connection, concurrency: 1, lockDuration: 3600000 }
);

hypertubeLogger.info(`Downloader worker started`);

// Non-blocking: resume seeding whatever's still within retention without
// delaying the worker's ability to pick up new jobs.
reconcileSeeds().catch((err) => {
  hypertubeLogger.error(`Seed reconciliation failed: ${formatUnknownError(err)}`);
});

// Handle graceful shutdown
process
  .on("SIGINT", () => gracefulShutdown("SIGINT", worker))
  .on("SIGTERM", () => gracefulShutdown("SIGTERM", worker));

// Handle completed jobs
worker.on("completed", async (job) => {
  switch (job.name) {
    case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
      return downloadMovieSuccessHandler(job);
    case MOVIE_QUEUE_JOB_NAMES.PREVIEW_MOVIE:
      hypertubeLogger.info(`[${job.data.movie.id}] Movie preview success`);
      return;
    case MOVIE_QUEUE_JOB_NAMES.STOP_SEEDING:
      return;
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
    case MOVIE_QUEUE_JOB_NAMES.PREVIEW_MOVIE:
      hypertubeLogger.info(
        `[${job.data.movie.id}] Movie preview failed: ${err}`
      );
      return;
    case MOVIE_QUEUE_JOB_NAMES.STOP_SEEDING:
      hypertubeLogger.error(`Stop-seeding job failed: ${err}`);
      return;
    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
});
