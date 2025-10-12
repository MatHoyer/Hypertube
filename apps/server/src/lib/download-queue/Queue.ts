import { DOWNLOAD_QUEUE, TJobData } from "@hypertube/libs";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../../env";

const connection = new IORedis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
});

export const downloadQueue = new Queue<TJobData>(DOWNLOAD_QUEUE, {
  connection,
});
