import type { TDownloaderJobData } from "@hypertube/libs";
import { DOWNLOADER_QUEUE } from "@hypertube/libs";
import { Queue } from "bullmq";
import { env } from "../../env";

const queue = new Queue<TDownloaderJobData>(DOWNLOADER_QUEUE, {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

export const produceDownload = async (data: TDownloaderJobData) => {
  await queue.add(data.movieId, data);
};