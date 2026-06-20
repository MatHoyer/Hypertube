import {
  deleteUsersSchemas,
  getUserSchemas,
  getUsersSchemas,
  patchUsersSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { TApiContext } from "../../middlewares/injectApiContext";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteUser,
  getAccounts,
  getSession,
  getUser,
  getUsers,
  patchUser,
} from "./users.controller";

const usersRouter = new Hono<TApiContext>();

usersRouter.get(
  "/",
  isLogged,
  searchParamsParser(getUsersSchemas.searchParams),
  getUsers
);

usersRouter.get(
  "/:userId",
  isLogged,
  urlParamsParser(getUserSchemas.urlParams),
  getUser
);

usersRouter.patch(
  "/:userId",
  isLogged,
  urlParamsParser(patchUsersSchemas.urlParams),
  bodyParser(patchUsersSchemas.requirements),
  patchUser
);

usersRouter.delete(
  "/:userId",
  isLogged,
  urlParamsParser(deleteUsersSchemas.urlParams),
  deleteUser
);

usersRouter.get("/me/accounts", isLogged, getAccounts);

usersRouter.get("/me/session", isLogged, getSession);

export default usersRouter;
