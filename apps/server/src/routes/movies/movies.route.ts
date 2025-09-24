import {
  getMovieSchemas,
  getMoviesSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { vpnChecker } from "../../middlewares/vpnChecker";
import {
  downloadMovie,
  downloadSubtitles,
  getMovie,
  getMovies,
} from "./movies.controller";

const moviesRouter = new Hono();

moviesRouter.get(
  "/",
  searchParamsParser(getMoviesSchemas.searchParams),
  getMovies
);

moviesRouter.get(
  "/:tmdbId",
  urlParamsParser(getMovieSchemas.urlParams),
  getMovie
);

moviesRouter.post(
  "/:tmdbId/download/resolutions/:resolution",
  vpnChecker(),
  urlParamsParser(postMovieDownloadResolutionSchemas.urlParams),
  downloadMovie
);

moviesRouter.post(
  "/:tmdbId/download/subtitles/:subtitlesLanguage",
  vpnChecker(),
  urlParamsParser(postMovieDownloadSubtitlesSchemas.urlParams),
  downloadSubtitles
);

export default moviesRouter;
