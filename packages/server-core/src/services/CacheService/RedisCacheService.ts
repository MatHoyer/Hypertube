import { Redis } from "ioredis";
import { env } from "../../env.js";
import { ICacheService } from "./ICacheService.js";

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export class RedisCacheService implements ICacheService {
  redisClient: Redis;

  constructor() {
    this.redisClient = redisClient;
  }

  set: ICacheService["set"] = (key, value, seconds) => {
    this.redisClient.set(key, value, "EX", seconds);
  };

  get: ICacheService["get"] = async (key) => {
    return await this.redisClient.get(key);
  };

  has: ICacheService["has"] = async (key) => {
    return !!(await this.get(key));
  };
}
