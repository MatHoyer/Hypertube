import { hypertubeLogger } from "@hypertube/libs";
import { Job, Queue, QueueEvents, QueueEventsListener } from "bullmq";
import { getRedisConnectionQueues } from "./Redis.js";
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
  private readonly events: QueueEvents;

  constructor(queueName: T) {
    const redisConnectionQueues = getRedisConnectionQueues();
    this.queue = new Queue<TQueueJobData[T]>(queueName, {
      connection: redisConnectionQueues,
    });
    this.events = new QueueEvents(queueName, {
      connection: redisConnectionQueues,
    });
  }

  async produce(jobName: TQueueJobName[T], data: TQueueJobData[T]) {
    // @ts-ignore bullmq is shit and doesn't support generics :)
    await this.queue.add(jobName, data);
  }

  async on(
    event: keyof QueueEventsListener,
    callback: (job: Job<TQueueJobData[T]>) => void
  ) {
    this.events.on(event, async ({ jobId }: { jobId: string }) => {
      const job = (await this.queue.getJob(jobId)) as Job<TQueueJobData[T]>;
      if (job) {
        callback(job);
      } else {
        hypertubeLogger.error(
          `[${this.queue.name}] Event ${event} - Job ${jobId} not found`
        );
      }
    });
  }

  removeListener(
    event: keyof QueueEventsListener,
    callback: (job: Job<TQueueJobData[T]>) => void
  ) {
    this.events.removeListener(event, callback);
  }
}
