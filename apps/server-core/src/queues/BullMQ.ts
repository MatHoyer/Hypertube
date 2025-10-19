import { Queue } from "bullmq";
import { redisConnection } from "./Redis.js";
import { DOWNLOAD_QUEUE, TDownloadJobData } from "./const.js";

type TQueueName = typeof DOWNLOAD_QUEUE;
type TQueueJobData = {
  [DOWNLOAD_QUEUE]: TDownloadJobData;
};
type TQueueJobName = {
  [DOWNLOAD_QUEUE]: "download";
};

export class BullMQ<T extends TQueueName> {
  private readonly queue: Queue<TQueueJobData[T]>;

  constructor(queueName: T) {
    this.queue = new Queue<TQueueJobData[T]>(queueName, {
      connection: redisConnection,
    });
  }

  async produce(jobName: TQueueJobName[T], data: TQueueJobData[T]) {
    // @ts-ignore bullmq is shit and doesn't support generics :)
    await this.queue.add(jobName, data);
  }
}
