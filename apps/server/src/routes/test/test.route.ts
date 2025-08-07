import { testSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import z from "zod";
import { bodyParser } from "../../middlewares/bodyParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { getPrisma, postPrisma, postTest } from "./test.controller";

const testRouter = new Hono();

testRouter.get("/prisma", getPrisma);

testRouter.post("/prisma", postPrisma);

testRouter.post(
  "/test/:id",
  urlParamsParser(z.object({ id: z.coerce.string() })),
  bodyParser(testSchemas.requirements),
  postTest
);

export default testRouter;
