import { DOWNLOAD_QUEUE, TDownloadJobData } from "@hypertube/libs";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../../../env";

const connection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

export const downloadQueue = new Queue<TDownloadJobData>(DOWNLOAD_QUEUE, {
  connection,
});
