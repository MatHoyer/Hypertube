import { describe, expect, it } from "vitest";

describe("GET /api/health", () => {
  it("returns 200 OK", async () => {
    const { createApp } = await import("../src/app.js");
    const app = createApp();
    const res = await app.request("/api/health");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });
});
