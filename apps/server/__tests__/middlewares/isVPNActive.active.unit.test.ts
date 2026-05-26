import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

vi.mock("@hypertube/server-core", () => ({
  env: { VPN_IS_ACTIVE: true },
}));

import { isVPNActive } from "../../src/middlewares/isVPNActive.js";

describe("isVPNActive when active", () => {
  it("passes through when VPN is active", async () => {
    const app = new Hono();
    app.get("/protected", isVPNActive, (c) => c.text("ok"));

    const res = await app.request("/protected");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});
