import { createMiddleware } from "hono/factory";
import type { ZodType } from "zod";

export type TUrlParamsParser<T> = { Variables: { validatedUrlParams: T } };

export const urlParamsParser = <T>(schema: ZodType<T>) => {
  return createMiddleware<TUrlParamsParser<T>>(async (c, next) => {
    const urlParams = c.req.param();
    const validatedUrlParams = schema.parse(urlParams);
    c.set("validatedUrlParams", validatedUrlParams);
    await next();
  });
};
