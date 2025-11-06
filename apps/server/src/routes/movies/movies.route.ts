import {
  deleteMovieSubscribeSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getMovieSSESchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  postMovieSubscribeSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { isLogged } from "../../middlewares/isLogged";
import { isVPNActive } from "../../middlewares/isVPNActive";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  downloadMovie,
  downloadSubtitles,
  getMovie,
  getMovies,
  getMovieSSE,
  subscribeToMovie,
  unsubscribeFromMovie,
} from "./movies.controller";

const moviesRouter = new Hono();

moviesRouter.get(
  "/",
  searchParamsParser(getMoviesSchemas.searchParams),
  getMovies
);

moviesRouter.get(
  "/:tmdbId",
  isLogged,
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

moviesRouter.post(
  "/:tmdbId/subscription",
  isLogged,
  urlParamsParser(postMovieSubscribeSchemas.urlParams),
  subscribeToMovie
);

moviesRouter.delete(
  "/:tmdbId/subscription",
  isLogged,
  urlParamsParser(deleteMovieSubscribeSchemas.urlParams),
  unsubscribeFromMovie
);

export default moviesRouter;
