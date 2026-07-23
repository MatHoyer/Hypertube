import { ICacheService, IStorageService } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";
import { container } from "../container";

export type TApiContext = {
  Variables: {
    cacheService: ICacheService;
    storageService: IStorageService;
  };
};

export const injectApiContext = createMiddleware<TApiContext>(
  async (c, next) => {
    c.set("cacheService", container.cacheService);
    c.set("storageService", container.storageService);
    await next();
  }
);
