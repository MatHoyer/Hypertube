import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import z from "zod";
import { urlParamsParser } from "../../src/middlewares/urlParamsParser.js";

const testSchema = z.object({
  id: z.coerce.number().positive(),
});

describe("urlParamsParser", () => {
  it("parses valid url params", async () => {
    const app = new Hono();
    app.get("/:id", urlParamsParser(testSchema), (c) =>
      c.json(c.get("validatedUrlParams"))
    );

    const res = await app.request("/42");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 42 });
  });

  it("returns 400 for invalid url params", async () => {
    const app = new Hono();
    app.get("/:id", urlParamsParser(testSchema), (c) =>
      c.json(c.get("validatedUrlParams"))
    );

    const res = await app.request("/invalid");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Validation failed");
  });
});
