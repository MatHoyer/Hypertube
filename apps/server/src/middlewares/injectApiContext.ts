import { ICacheService, RedisCacheService } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";

export type TApiContext = {
  Variables: {
    cacheService: ICacheService;
  };
};

const cacheService = new RedisCacheService();

export const injectApiContext = createMiddleware<TApiContext>(
  async (c, next) => {
    c.set("cacheService", cacheService);
    await next();
  }
);
