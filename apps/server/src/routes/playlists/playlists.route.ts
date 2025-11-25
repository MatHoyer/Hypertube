import {
  deleteMovieToPlaylistSchemas,
  deletePlaylistSchemas,
  postMovieToPlaylistSchemas,
  postPlaylistSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteMovieToPlaylist,
  deletePlaylist,
  getPlaylists,
  postMovieToPlaylist,
  postPlaylist,
} from "./playlists.controller";

const playlistsRouter = new Hono();

playlistsRouter.get("/", isLogged, getPlaylists);

playlistsRouter.post(
  "/",
  isLogged,
  bodyParser(postPlaylistSchemas.requirements),
  postPlaylist
);

playlistsRouter.delete(
  "/:playlistId",
  isLogged,
  urlParamsParser(deletePlaylistSchemas.urlParams),
  deletePlaylist
);

playlistsRouter.post(
  "/:playlistId/movie",
  isLogged,
  urlParamsParser(postMovieToPlaylistSchemas.urlParams),
  bodyParser(postMovieToPlaylistSchemas.requirements),
  postMovieToPlaylist
);

playlistsRouter.delete(
  "/:playlistId/movie/:movieId",
  isLogged,
  urlParamsParser(deleteMovieToPlaylistSchemas.urlParams),
  deleteMovieToPlaylist
);

export default playlistsRouter;
