import { createMiddleware } from "hono/factory";
import type { ZodType } from "zod";

export type TBodyParser<T> = { Variables: { validatedBody: T } };

export const bodyParser = <T>(
  schema: ZodType<T>,
  bodyType: "json" | "formData" = "json"
) => {
  return createMiddleware<TBodyParser<T>>(async (c, next) => {
    try {
      let body;
      switch (bodyType) {
        case "json":
          body = await c.req.json();
          break;
        case "formData":
          body = { ...(await c.req.parseBody()) };
          break;
      }

      const validatedBody = schema.parse(body);
      c.set("validatedBody", validatedBody);

      await next();
    } catch (error) {
      console.log(error);
      return c.json(
        {
          message: "Validation failed",
          cause: error,
        },
        400
      );
    }
  });
};
