import {
  deleteMovieFromHistorySchemas,
  getHistorySchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteHistory,
  deleteMovieFromHistory,
  getHistory,
} from "./history.controller";

const historyRouter = new Hono();

historyRouter.get(
  "/",
  isLogged,
  searchParamsParser(getHistorySchemas.searchParams),
  getHistory
);

historyRouter.delete("/", isLogged, deleteHistory);

historyRouter.delete(
  "/:tmdbId",
  isLogged,
  urlParamsParser(deleteMovieFromHistorySchemas.urlParams),
  deleteMovieFromHistory
);

export default historyRouter;
