import { deletePlaylistSchemas, postPlaylistSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylists,
} from "./playlists.controller";

const playlistsRouter = new Hono();

playlistsRouter.get("/", isLogged, getPlaylists);

playlistsRouter.post(
  "/",
  isLogged,
  bodyParser(postPlaylistSchemas.requirements),
  createPlaylist
);

playlistsRouter.delete(
  "/:playlistId",
  isLogged,
  urlParamsParser(deletePlaylistSchemas.urlParams),
  deletePlaylist
);

export default playlistsRouter;
