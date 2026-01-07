import {
  deleteMovieFromPlaylistSchemas,
  deletePlaylistSchemas,
  getPlaylistSchemas,
  getPlaylistsSchemas,
  postMovieToPlaylistSchemas,
  postPlaylistSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteMovieFromPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  postMovieToPlaylist,
  postPlaylist,
} from "./playlists.controller";

const playlistsRouter = new Hono();

playlistsRouter.get(
  "/",
  isLogged,
  searchParamsParser(getPlaylistsSchemas.searchParams),
  getPlaylists
);

playlistsRouter.post(
  "/",
  isLogged,
  bodyParser(postPlaylistSchemas.requirements),
  postPlaylist
);

playlistsRouter.get(
  "/:playlistId",
  isLogged,
  urlParamsParser(getPlaylistSchemas.urlParams),
  searchParamsParser(getPlaylistSchemas.searchParams),
  getPlaylist
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
  "/:playlistId/movie/:tmdbId",
  isLogged,
  urlParamsParser(deleteMovieFromPlaylistSchemas.urlParams),
  deleteMovieFromPlaylist
);

export default playlistsRouter;
