import {
  getYtsDownloadResolutionSchemas,
  getYtsDownloadSubtitlesSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { searchParamsParser } from "../../middlewares/searchParamsParser.js";
import { urlParamsParser } from "../../middlewares/urlParamsParser.js";
import { vpnChecker } from "../../middlewares/vpnChecker.js";
import {
  getYtsDownloadResolution,
  getYtsDownloadSubtitles,
  getYtsFilters,
  getYtsMovieData,
  getYtsMovies,
  getYtsPagination,
} from "./yts.controller.js";

const ytsRouter = new Hono();

ytsRouter.get("/filters", getYtsFilters);

ytsRouter.get(
  "/movies",
  searchParamsParser(getYtsMoviesSchemas.searchParams.partial()),
  getYtsMovies
);

ytsRouter.get(
  "/movie/:movieId",
  urlParamsParser(getYtsMovieDataSchemas.urlParams),
  getYtsMovieData
);

ytsRouter.get(
  "/movie/:movieId/resolution/:resolution",
  vpnChecker(),
  urlParamsParser(getYtsDownloadResolutionSchemas.urlParams),
  getYtsDownloadResolution
);

ytsRouter.get(
  "/movie/:movieId/subtitles/:subtitlesLanguage",
  vpnChecker(),
  urlParamsParser(getYtsDownloadSubtitlesSchemas.urlParams),
  getYtsDownloadSubtitles
);

ytsRouter.get(
  "/pagination",
  searchParamsParser(getYtsPaginationSchemas.searchParams.partial()),
  getYtsPagination
);

export default ytsRouter;
