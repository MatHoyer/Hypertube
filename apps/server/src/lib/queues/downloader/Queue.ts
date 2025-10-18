import { DOWNLOAD_QUEUE, TDownloadJobData } from "@hypertube/libs";
import { env } from "@hypertube/server-core";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

export const downloadQueue = new Queue<TDownloadJobData>(DOWNLOAD_QUEUE, {
  connection,
});
