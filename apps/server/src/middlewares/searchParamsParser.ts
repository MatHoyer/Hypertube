import { createMiddleware } from "hono/factory";
import type { ZodType } from "zod";

export type TSearchParamsParser<T> = {
  Variables: { validatedSearchParams: T };
};

export const searchParamsParser = <T>(schema: ZodType<T>) => {
  return createMiddleware<TSearchParamsParser<T>>(async (c, next) => {
    const searchParams = c.req.query();
    const validatedSearchParams = schema.parse(searchParams);
    c.set("validatedSearchParams", validatedSearchParams);
    await next();
  });
};
