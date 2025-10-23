import { BullMQ, DOWNLOAD_QUEUE } from "@hypertube/server-core";

export const downloaderQueue = new BullMQ(DOWNLOAD_QUEUE);
