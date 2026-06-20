import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { TApiContext } from "../../middlewares/injectApiContext";
import openApiDoc from "./swagger.controller";

const swaggerRouter = new Hono<TApiContext>();

swaggerRouter.get("/doc", (c) => c.json(openApiDoc));

swaggerRouter.get("/ui", swaggerUI({ url: "/api/swagger/doc" }));

export default swaggerRouter;
