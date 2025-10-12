import { DOWNLOAD_QUEUE, hypertubeLogger, TJobData } from "@hypertube/libs";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import { env } from "./env.js";
import { notifyServer } from "./notifyServer.js";

const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const worker = new Worker<TJobData>(
  DOWNLOAD_QUEUE,
  async (job: Job<TJobData>) => {
    hypertubeLogger.info(`[${job.data.movieId}] Download job started`);

    await new Promise((r) => setTimeout(r, 2000));
  },
  { connection }
);

worker.on("completed", async (job) => {
  hypertubeLogger.info(`[${job.data.movieId}] Download job completed`);
  try {
    await notifyServer({
      movieId: job.data.movieId,
      resolution: job.data.resolution,
      success: true,
    });
  } catch (err) {
    hypertubeLogger.error(
      `[${job.data.movieId}] Failed to notify server : ${JSON.stringify(err)}`
    );
  }
});

worker.on("failed", async (job, err) => {
  hypertubeLogger.error(
    `[${job?.data.movieId}] Download job failed : ${JSON.stringify(err)}`
  );
  if (!job) return;
  try {
    await notifyServer({
      movieId: job.data.movieId,
      resolution: job.data.resolution,
      success: false,
    });
  } catch (err) {
    hypertubeLogger.error(
      `[${job?.data.movieId}] Failed to notify server : ${JSON.stringify(err)}`
    );
  }
});
