import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import { Worker } from "bullmq";

export const gracefulShutdown = async (signal: string, worker: Worker) => {
  hypertubeLogger.info(`Shutting down downloader on signal: ${signal}`);

  try {
    await worker.close();
    hypertubeLogger.info("Worker gracefully shut down");
  } catch (error) {
    hypertubeLogger.error(
      `Error shutting down worker: ${formatUnknownError(error)}`
    );
  } finally {
    process.exit(0);
  }
};
