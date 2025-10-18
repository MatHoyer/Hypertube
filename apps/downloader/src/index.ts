import {
  DOWNLOAD_QUEUE,
  hypertubeLogger,
  TDownloadJobData,
} from "@hypertube/libs";
import { env } from "@hypertube/server-core";
import { Job, Worker } from "bullmq";
import { Redis } from "ioredis";
import { downloadMovie } from "./downloader/downloadMovie.js";
import { failedNotifyServer, successNotifyServer } from "./notifyServer.js";

const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

const worker = new Worker<TDownloadJobData>(
  DOWNLOAD_QUEUE,
  async (job: Job<TDownloadJobData>) => {
    hypertubeLogger.info(`[${job.data.movie.id}] Download torrent job started`);

    await downloadMovie(job.data.movie, job.data.resolution);
  },
  { connection }
);

worker.on("completed", async (job) => {
  hypertubeLogger.info(
    `[${job.data.movie.id}] Launch transmission download success`
  );
  await successNotifyServer({
    type: "started",
    movieId: job.data.movie.id,
    resolution: job.data.resolution,
  });
});

worker.on("failed", async (job, err) => {
  hypertubeLogger.error(
    `[${
      job?.data.movie.id
    }] Launch transmission download failed : ${JSON.stringify(err)}`
  );
  if (!job?.data.movie.id || !job?.data.resolution) {
    hypertubeLogger.error(
      `[${job?.data.movie.id}] Can't notify server : No movieId or resolution`
    );
    return;
  }
  await failedNotifyServer({
    type: "started",
    movieId: job?.data.movie.id,
    resolution: job?.data.resolution,
  });
});
