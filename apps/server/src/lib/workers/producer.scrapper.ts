import type { TScrapperJobData } from "@hypertube/libs";
import { SCRAPPER_QUEUE } from "@hypertube/libs";
import { Queue } from "bullmq";
import { env } from "../../env";

const queue = new Queue<TScrapperJobData>(SCRAPPER_QUEUE, {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});

export const produceScrapper = async (data: TScrapperJobData) => {
  await queue.add(data.movieId, data);
};