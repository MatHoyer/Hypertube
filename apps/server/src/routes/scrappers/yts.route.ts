import {
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { searchParamsParser } from "../../middlewares/searchParamsParser.js";
import {
  getYtsFilters,
  getYtsMovieData,
  getYtsMovies,
  getYtsPagination,
} from "./yts.controller.js";

const ytsRouter = new Hono();

ytsRouter.get("/filters", getYtsFilters);

ytsRouter.get(
  "/movies",
  searchParamsParser(getYtsMoviesSchemas.searchParams),
  getYtsMovies
);

ytsRouter.get(
  "/movie",
  searchParamsParser(getYtsMovieDataSchemas.searchParams),
  getYtsMovieData
);

ytsRouter.get(
  "/pagination",
  searchParamsParser(getYtsPaginationSchemas.searchParams),
  getYtsPagination
);

export default ytsRouter;
