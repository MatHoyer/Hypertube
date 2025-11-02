import { TPostTokenSchemas } from "@hypertube/libs";
import { createMiddleware } from "hono/factory";
import type { ZodType } from "zod";

export type TBodyParser<T> = { Variables: { validatedBody: T } };

export const bodyParser = <T>(
  schema: ZodType<T>,
  bodyType: "json" | "formData" | "application/x-www-form-urlencoded" = "json"
) => {
  return createMiddleware<TBodyParser<T>>(async (c, next) => {
    try {
      let body;
      switch (bodyType) {
        case "json":
          body = await c.req.json();
          break;
        case "application/x-www-form-urlencoded": {
          const receivedBody = await c.req.parseBody<
            TPostTokenSchemas["requirements"]
          >();
          const basicAuth = c.req.header("Authorization")?.split(" ")[1];
          let clientId,
            clientSecret = "";
          if (basicAuth) {
            [clientId, clientSecret] = Buffer.from(basicAuth, "base64")
              .toString("utf-8")
              .split(":");
          } else {
            clientId = receivedBody.clientId;
            clientSecret = receivedBody.clientSecret;
          }
          body = { ...receivedBody, clientId, clientSecret };
          break;
        }
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
        },
        400
      );
    }
  });
};
