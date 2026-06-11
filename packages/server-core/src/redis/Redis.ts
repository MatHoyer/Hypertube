import { Redis } from "ioredis";
import { env } from "../env.js";

let redisConnectionQueues: Redis | null = null;
let redisPublisher: Redis | null = null;

export const getRedisConnectionQueues = () => {
  if (!redisConnectionQueues) {
    redisConnectionQueues = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
    });
  }

  return redisConnectionQueues;
};

export const getRedisPublisher = () => {
  if (!redisPublisher) {
    redisPublisher = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
    });
  }

  return redisPublisher;
};

export const getRedisSubscriber = () => {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  });
};

export const getRedisBetterAuth = () => {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  });
};
