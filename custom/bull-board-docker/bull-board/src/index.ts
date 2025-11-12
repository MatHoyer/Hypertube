import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Queue } from "bullmq";
import { Hono } from "hono";
import Redis from "ioredis";

const app = new Hono();

// Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

// Discover all BullMQ queues dynamically
async function discoverQueues() {
  const keys = await redisConnection.keys("bull:*:meta");
  const queueNames = new Set(
    keys.map((key) => key.split(":")[1]).filter(Boolean)
  );

  return Array.from(queueNames).map(
    (name) =>
      new BullMQAdapter(new Queue(name, { connection: redisConnection }))
  );
}

const serverAdapter = new HonoAdapter(serveStatic);

(async () => {
  const boardQueues = await discoverQueues();
  console.log(`Discovered ${boardQueues.length} queues`);

  createBullBoard({
    queues: boardQueues,
    serverAdapter,
  });

  serverAdapter.setBasePath("/");

  app.route("/", serverAdapter.registerPlugin());

  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
})();
