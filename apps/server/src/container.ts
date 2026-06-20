import { RedisCacheService } from "@hypertube/server-core";

export const container = {
  cacheService: new RedisCacheService(),
} as const;
