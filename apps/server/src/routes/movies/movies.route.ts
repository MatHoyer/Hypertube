import {
  getMovieSchemas,
  getMoviesSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { isVPNActive } from "../../middlewares/isVPNActive";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
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
  isVPNActive,
  urlParamsParser(postMovieDownloadResolutionSchemas.urlParams),
  downloadMovie
);

moviesRouter.post(
  "/:tmdbId/download/subtitles/:subtitlesLanguage",
  isVPNActive,
  urlParamsParser(postMovieDownloadSubtitlesSchemas.urlParams),
  downloadSubtitles
);

export default moviesRouter;
