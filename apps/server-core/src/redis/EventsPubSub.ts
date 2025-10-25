import { Redis } from "ioredis";
import { getRedisSubscriber, redisPublisher } from "./Redis.js";

type TEventsAddOns = {
  notification: {
    userId: string;
  };
};

type TEvents = keyof TEventsAddOns;

type TEventsAddOnsMap<T extends TEvents> = T extends keyof TEventsAddOns
  ? TEventsAddOns[T]
  : never;

const completeEvents: {
  [T in TEvents]: (params: TEventsAddOnsMap<T>) => string;
} = {
  notification: ({ userId }) => `notification:${userId}`,
};

type TEventData = {
  notification: {
    title: string;
    message: string;
  };
};

type TEventsArgs<T extends TEvents> = TEventsAddOnsMap<T> extends undefined
  ? { event: T }
  : { event: T } & TEventsAddOnsMap<T>;

const getCompleteEvents = <T extends TEvents>(
  events: TEventsArgs<T> | TEventsArgs<T>[]
) => {
  const tmpEvents = Array.isArray(events) ? events : [events];
  return tmpEvents.map((event) => {
    const { event: eventName, ...addOns } = event;
    return completeEvents[eventName](addOns as unknown as TEventsAddOnsMap<T>);
  });
};

export class EventsPublisher<T extends TEvents> {
  private readonly publisher: Redis;
  private readonly events: string[];

  constructor(events: TEventsArgs<T> | TEventsArgs<T>[]) {
    this.publisher = redisPublisher;
    this.events = getCompleteEvents(events);
  }

  async publish(data: TEventData[T]) {
    for (const event of this.events) {
      await this.publisher.publish(event, JSON.stringify(data));
    }
  }
}

export class EventsSubscriber<T extends TEvents> {
  private readonly subscriber: Redis;
  private readonly events: string[];
  private readonly callback: (data: TEventData[T]) => Promise<void> | void;

  constructor(
    events: TEventsArgs<T> | TEventsArgs<T>[],
    callback: (data: TEventData[T]) => Promise<void> | void
  ) {
    this.subscriber = getRedisSubscriber();
    this.callback = callback;
    this.events = getCompleteEvents(events);
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
