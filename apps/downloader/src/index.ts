import { DOWNLOAD_QUEUE, TJobData } from "@hypertube/libs";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import "./env";
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
    console.log(`Download job started for movie ${job.data.movieId}`);

    await new Promise((r) => setTimeout(r, 2000));

    console.log(`Job done for movie ${job.data.movieId}`);
  },
  { connection }
);

worker.on("completed", async (job) => {
  console.log(`Job ${job.id} completed for movie ${job.data.movieId}`);
  try {
    await notifyServer({
      movieId: job.data.movieId,
      resolution: job.data.resolution,
      success: true,
    });
  } catch (err) {
    console.error("Failed to notify server :", err);
  }
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed for movie ${job?.data.movieId}`, err);
  if (!job) return;
  try {
    await notifyServer({
      movieId: job.data.movieId,
      resolution: job.data.resolution,
      success: false,
    });
  } catch (err) {
    console.error("Failed to notify server :", err);
  }
});
