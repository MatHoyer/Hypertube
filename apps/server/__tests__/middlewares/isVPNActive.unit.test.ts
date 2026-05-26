import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

vi.mock("@hypertube/server-core", () => ({
  env: { VPN_IS_ACTIVE: false },
}));

import { isVPNActive } from "../../src/middlewares/isVPNActive.js";

describe("isVPNActive", () => {
  it("returns 403 when VPN is not active", async () => {
    const app = new Hono();
    app.get("/protected", isVPNActive, (c) => c.text("ok"));

    const res = await app.request("/protected");
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "VPN is needed and not active on the server",
    });
  });
});
