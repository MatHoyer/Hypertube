import { testSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middleware/bodyParser";
import { getPrisma, postPrisma, postTest } from "./test.controller";

const testRouter = new Hono();

testRouter.get("/prisma", getPrisma);

testRouter.post("/prisma", postPrisma);

testRouter.post("/test/:id", bodyParser(testSchemas.requirements), postTest);

export default testRouter;
