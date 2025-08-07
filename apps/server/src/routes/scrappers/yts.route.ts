import { postYtsFiltersSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import z from "zod";
import { bodyParser } from "../../middlewares/bodyParser.js";
import { searchParamsParser } from "../../middlewares/searchParamsParser.js";
import {
  getYtsFilters,
  getYtsPagination,
  postYtsFilters,
} from "./yts.controller.js";

const ytsRouter = new Hono();

ytsRouter.get("/filters", getYtsFilters);

ytsRouter.post(
  "/filters",
  bodyParser(postYtsFiltersSchemas.requirements),
  postYtsFilters
);

ytsRouter.get(
  "/pagination",
  searchParamsParser(z.record(z.string(), z.string())),
  getYtsPagination
);

export default ytsRouter;
