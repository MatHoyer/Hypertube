import { Redis } from "ioredis";
import { getRedisPublisher, getRedisSubscriber } from "./Redis.js";

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

type TEventsArgs<T extends TEvents> =
  TEventsAddOnsMap<T> extends undefined
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
    this.publisher = getRedisPublisher();
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
  private readonly callback: (
    channel: string,
    message: string
  ) => Promise<void> | void;

  constructor(
    events: TEventsArgs<T> | TEventsArgs<T>[],
    callback: (data: TEventData[T]) => Promise<void> | void
  ) {
    this.events = getCompleteEvents(events);
    this.callback = async (channel, message) => {
      await callback(JSON.parse(message) as TEventData[T]);
    };

    this.subscriber = getRedisSubscriber();
    this.subscriber.subscribe(...this.events);
    this.subscriber.on("message", this.callback);
  }

  destroy() {
    this.subscriber.removeListener("message", this.callback);
    this.subscriber.unsubscribe(...this.events);
    this.subscriber.quit();
  }
}

export class EventsAsyncIterator<T extends TEvents> {
  private readonly subscriber: Redis;
  private readonly events: string[];
  private queue: TEventData[T][] = [];
  private resolveNext: ((value: TEventData[T]) => void) | null = null;
  private closed = false;

  constructor(events: TEventsArgs<T> | TEventsArgs<T>[]) {
    this.events = getCompleteEvents(events);
    this.subscriber = getRedisSubscriber();
    this.subscriber.subscribe(...this.events);
    this.subscriber.on("message", async (channel, message) => {
      const data = JSON.parse(message) as TEventData[T];
      if (this.resolveNext) {
        this.resolveNext(data);
        this.resolveNext = null;
      } else {
        this.queue.push(data);
      }
    });
  }

  async *[Symbol.asyncIterator](): AsyncIterator<TEventData[T]> {
    while (!this.closed) {
      yield this.queue.length > 0
        ? this.queue.shift()!
        : await new Promise<TEventData[T]>((resolve) => {
            this.resolveNext = resolve;
          });
    }
  }

  destroy() {
    this.closed = true;
    if (this.resolveNext) this.resolveNext(null as any);
    this.subscriber.unsubscribe(...this.events);
    this.subscriber.quit();
  }
}
