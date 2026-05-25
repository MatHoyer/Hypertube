import { BullMQ, DOWNLOAD_QUEUE } from "@hypertube/server-core";

let downloaderQueue: BullMQ<typeof DOWNLOAD_QUEUE> | null = null;

export const getDownloaderQueue = () => {
  if (!downloaderQueue) {
    downloaderQueue = new BullMQ(DOWNLOAD_QUEUE);
  }
  return downloaderQueue;
};
