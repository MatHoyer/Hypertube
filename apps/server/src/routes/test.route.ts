import { Hono } from "hono";
import { getPrisma, postPrisma } from "../controllers/test.controller.js";

const testRouter = new Hono();

testRouter.get("/prisma", getPrisma);

testRouter.post("/prisma", postPrisma);

testRouter.post("/test/:id", async (c) => {
  const body = await c.req.json();
  return c.json({
    id: `${c.req.param("id")}+${body.id}`,
  });
});

export default testRouter;
