import {
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getMovieSSESchemas,
  postMovieCommentSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { isVPNActive } from "../../middlewares/isVPNActive";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  commentMovie,
  deleteMovieLike,
  downloadMovie,
  downloadSubtitles,
  getMovie,
  getMovieComments,
  getMovies,
  getMovieSSE,
  likeMovie,
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

moviesRouter.get(
  "/:tmdbId/comments",
  urlParamsParser(getMovieCommentSchemas.urlParams),
  searchParamsParser(getMovieCommentSchemas.searchParams),
  getMovieComments
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

moviesRouter.post(
  "/:tmdbId/like",
  isLogged,
  urlParamsParser(postMovieLikeSchemas.urlParams),
  likeMovie
);

moviesRouter.post(
  "/:tmdbId/comments",
  isLogged,
  urlParamsParser(postMovieCommentSchemas.urlParams),
  bodyParser(postMovieCommentSchemas.requirements),
  commentMovie
);

moviesRouter.delete(
  "/:tmdbId/like",
  isLogged,
  urlParamsParser(deleteMovieLikeSchemas.urlParams),
  deleteMovieLike
);

export default moviesRouter;
