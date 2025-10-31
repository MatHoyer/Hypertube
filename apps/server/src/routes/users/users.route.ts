import { patchUsersSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { getAccounts, getSession, patchUser } from "./users.controller";

const usersRouter = new Hono();

usersRouter.patch(
  "/:userId",
  isLogged,
  urlParamsParser(patchUsersSchemas.urlParams),
  bodyParser(patchUsersSchemas.requirements),
  patchUser
);

usersRouter.get("/accounts", isLogged, getAccounts);

usersRouter.get("/session", isLogged, getSession);

export default usersRouter;
