import { postYtsFiltersSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { YtsScrapper } from "../../lib/scrapper/yts.scrapper.js";
import { bodyParser } from "../../middlewares/bodyParser.js";
import { getYtsFilters, postYtsFilters } from "./yts.controller.js";

const ytsRouter = new Hono();
const ytsScrapper = new YtsScrapper();

ytsRouter.get("/filters", getYtsFilters);

ytsRouter.post(
  "/filters",
  bodyParser(postYtsFiltersSchemas.requirements),
  postYtsFilters
);

export default ytsRouter;
