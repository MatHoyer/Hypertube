import { ICacheService } from "@hypertube/server-core";
import { createMiddleware } from "hono/factory";
import { container } from "../container";

export type TApiContext = {
  Variables: {
    cacheService: ICacheService;
  };
};

export const injectApiContext = createMiddleware<TApiContext>(
  async (c, next) => {
    c.set("cacheService", container.cacheService);
    await next();
  }
);
