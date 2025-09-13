import { Worker } from "bullmq";

type TJobData = {
  movieId: string;
};

const worker = new Worker<TJobData>("downloader", async (job) => {
  console.log(job.data.movieId);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.data.movieId} failed: ${error}`);
});