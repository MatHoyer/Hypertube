import { serve } from "@hono/node-server";
import { Hono } from "hono";
import testRouter from "./routes/test.route.js";

const app = new Hono();

app.get("/api/health", (c) => c.text("OK"));

app.route("/test", testRouter);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
