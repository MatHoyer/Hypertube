import type { TScrapperJobData } from "@hypertube/libs";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "process";


if (!env.REDIS_HOST || !env.REDIS_PORT) {
  throw new Error("REDIS_HOST and REDIS_PORT must be set");
}

const connection = new IORedis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  maxRetriesPerRequest: null
});

const worker = new Worker<TScrapperJobData>("scrapper", async (job) => {
  console.log(job.data.movieId);
}, { connection });

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.data.movieId} failed: ${error}`);
});