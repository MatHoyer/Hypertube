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
  putMovieWatchTimerSchemas,
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
  getMovieCasting,
  getMovieComments,
  getMovies,
  getMovieSSE,
  likeMovie,
  putMovieWatchTimer,
  subscribeToMovie,
  unsubscribeFromMovie,
} from "./movies.controller";

const moviesRouter = new Hono();

moviesRouter.get(
  "/",
  isLogged,
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
  isLogged,
  urlParamsParser(getMovieSSESchemas.urlParams),
  getMovieSSE
);

moviesRouter.post(
  "/:tmdbId/resolutions/:resolution/download",
  isVPNActive,
  isLogged,
  urlParamsParser(postMovieDownloadResolutionSchemas.urlParams),
  downloadMovie
);

moviesRouter.post(
  "/:tmdbId/subtitles/:subtitlesLanguage/download",
  isVPNActive,
  isLogged,
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

moviesRouter.delete(
  "/:tmdbId/like",
  isLogged,
  urlParamsParser(deleteMovieLikeSchemas.urlParams),
  deleteMovieLike
);

moviesRouter.get(
  "/:tmdbId/comments",
  isLogged,
  urlParamsParser(getMovieCommentSchemas.urlParams),
  searchParamsParser(getMovieCommentSchemas.searchParams),
  getMovieComments
);

moviesRouter.post(
  "/:tmdbId/comments",
  isLogged,
  urlParamsParser(postMovieCommentSchemas.urlParams),
  bodyParser(postMovieCommentSchemas.requirements),
  commentMovie
);

moviesRouter.put(
  "/:tmdbId/watch-timer",
  isLogged,
  urlParamsParser(putMovieWatchTimerSchemas.urlParams),
  bodyParser(putMovieWatchTimerSchemas.requirements),
  putMovieWatchTimer
);

moviesRouter.get(
  "/:tmdbId/casting",
  isLogged,
  urlParamsParser(putMovieWatchTimerSchemas.urlParams),
  getMovieCasting
);

export default moviesRouter;
