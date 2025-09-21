import {
  getMovieSchemas,
  getMoviesSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { getMovie, getMovies } from "./movie.controller";

const moviesRouter = new Hono();

moviesRouter.get(
  "/",
  searchParamsParser(getMoviesSchemas.searchParams),
  getMovies
);

moviesRouter.get(
  "/:movieId",
  urlParamsParser(getMovieSchemas.urlParams),
  getMovie
);

moviesRouter.post(
  "/:movieId/download/resolutions/:resolution",
  urlParamsParser(postMovieDownloadResolutionSchemas.urlParams)
);

moviesRouter.post(
  "/:movieId/download/subtitles/:subtitlesLanguage",
  urlParamsParser(postMovieDownloadSubtitlesSchemas.urlParams)
);

export default moviesRouter;
