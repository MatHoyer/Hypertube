import { postTokenSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import z from "zod";
import { bodyParser } from "../../src/middlewares/bodyParser.js";

const testSchema = z.object({
  name: z.string().min(1),
});

describe("bodyParser", () => {
  const createTestApp = () => {
    const app = new Hono();
    app.post("/test", bodyParser(testSchema), (c) =>
      c.json(c.get("validatedBody"))
    );
    return app;
  };

  it("parses valid JSON body", async () => {
    const app = createTestApp();
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "test" });
  });

  it("returns 400 for invalid JSON body", async () => {
    const app = createTestApp();
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Validation failed" });
  });

  it("parses application/x-www-form-urlencoded with basic auth", async () => {
    const app = new Hono();
    app.post(
      "/token",
      bodyParser(postTokenSchemas.requirements, "application/x-www-form-urlencoded"),
      (c) => c.json(c.get("validatedBody"))
    );

    const credentials = Buffer.from("client-id:client-secret").toString(
      "base64"
    );
    const res = await app.request("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      clientId: "client-id",
      clientSecret: "client-secret",
      grant_type: "client_credentials",
    });
  });
});
