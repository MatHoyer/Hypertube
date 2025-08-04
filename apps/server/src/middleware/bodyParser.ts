import { createMiddleware } from "hono/factory";
import type { ZodType } from "zod";

export type TBodyParser<T> = { Variables: { validatedBody: T } };

export const bodyParser = <T>(schema: ZodType<T>) => {
  return createMiddleware<TBodyParser<T>>(async (c, next) => {
    try {
      const body = await c.req.json();
      const validatedBody = schema.parse(body);
      c.set("validatedBody", validatedBody);
      console.log(validatedBody);
      await next();
    } catch (error) {
      c.status(400);
      return c.json({
        message: "Validation failed",
        cause: error,
      });
    }
  });
};
