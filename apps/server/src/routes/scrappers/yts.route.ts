import {
  getYtsDownloadMovieSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { searchParamsParser } from "../../middlewares/searchParamsParser.js";
import { urlParamsParser } from "../../middlewares/urlParamsParser.js";
import {
  getYtsDownloadMovie,
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
  "/movie/:id",
  urlParamsParser(getYtsMovieDataSchemas.urlParams),
  getYtsMovieData
);

ytsRouter.get(
  "/movie/:movieId/resolution/:resolution/subtitles/:subtitlesLanguage/download",
  urlParamsParser(getYtsDownloadMovieSchemas.urlParams),
  getYtsDownloadMovie
);

ytsRouter.get(
  "/pagination",
  searchParamsParser(getYtsPaginationSchemas.searchParams),
  getYtsPagination
);

export default ytsRouter;
