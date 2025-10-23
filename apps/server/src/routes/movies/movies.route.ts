import {
  getMovieSchemas,
  getMoviesSchemas,
  getMovieSSESchemas,
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
  getMovieSSE,
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

moviesRouter.get(
  "/:tmdbId/sse",
  urlParamsParser(getMovieSSESchemas.urlParams),
  getMovieSSE
);

moviesRouter.post(
  "/:tmdbId/resolutions/:resolution/download",
  isVPNActive,
  urlParamsParser(postMovieDownloadResolutionSchemas.urlParams),
  downloadMovie
);

moviesRouter.post(
  "/:tmdbId/subtitles/:subtitlesLanguage/download",
  isVPNActive,
  urlParamsParser(postMovieDownloadSubtitlesSchemas.urlParams),
  downloadSubtitles
);

export default moviesRouter;
