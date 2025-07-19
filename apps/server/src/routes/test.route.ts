import { Hono } from "hono";
import { getPrisma, postPrisma } from "../controllers/test.controller.js";

const testRouter = new Hono();

testRouter.get("/prisma", getPrisma);

testRouter.post("/prisma", postPrisma);

export default testRouter;
