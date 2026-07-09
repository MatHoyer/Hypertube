import { MinioStorageService, RedisCacheService } from "@hypertube/server-core";

export const container = {
  cacheService: new RedisCacheService(),
  storageService: new MinioStorageService(),
} as const;
