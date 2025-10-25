import { Redis } from "ioredis";
import { getRedisSubscriber, redisPublisher } from "./Redis.js";

type TEventNames = "notification";

type TEventData = {
  notification: {
    title: string;
    message: string;
  };
};

export class EventsPublisher<T extends TEventNames> {
  private readonly publisher: Redis;
  private readonly events: T[];

  constructor(events: T | T[]) {
    this.publisher = redisPublisher;
    this.events = Array.isArray(events) ? events : [events];
  }

  async publish(data: TEventData[T]) {
    for (const event of this.events) {
      await this.publisher.publish(event, JSON.stringify(data));
    }
  }
}

export class EventsSubscriber<T extends TEventNames> {
  private readonly subscriber: Redis;
  private readonly events: T[];
  private readonly callback: (data: TEventData[T]) => Promise<void> | void;

  constructor(
    event: T | T[],
    callback: (data: TEventData[T]) => Promise<void> | void
  ) {
    this.subscriber = getRedisSubscriber();
    this.events = Array.isArray(event) ? event : [event];
    this.callback = callback;
    this.subscriber.subscribe(...this.events);
    this.subscriber.on("message", async (channel, message) => {
      await this.callback(JSON.parse(message) as TEventData[T]);
    });
  }

  destroy() {
    this.subscriber.removeListener("message", this.callback);
    this.subscriber.unsubscribe(...this.events);
    this.subscriber.quit();
  }
}
