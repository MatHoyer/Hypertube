import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import z from "zod";
import { searchParamsParser } from "../../src/middlewares/searchParamsParser.js";

const testSchema = z.object({
  page: z.coerce.number().positive(),
  pageSize: z.coerce.number().positive().max(100),
});

describe("searchParamsParser", () => {
  it("parses valid search params", async () => {
    const app = new Hono();
    app.get("/test", searchParamsParser(testSchema), (c) =>
      c.json(c.get("validatedSearchParams"))
    );

    const res = await app.request("/test?page=1&pageSize=10");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ page: 1, pageSize: 10 });
  });

  it("returns 400 for invalid search params", async () => {
    const app = new Hono();
    app.get("/test", searchParamsParser(testSchema), (c) =>
      c.json(c.get("validatedSearchParams"))
    );

    const res = await app.request("/test?page=0&pageSize=10");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Validation failed");
  });
});
