import {
  ICacheService,
  IStorageService,
  MinioStorageService,
  RedisCacheService,
} from "@hypertube/server-core";

export const container: {
  cacheService: ICacheService;
  storageService: IStorageService;
} = {
  cacheService: new RedisCacheService(),
  storageService: new MinioStorageService(),
};
