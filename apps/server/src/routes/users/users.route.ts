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

usersRouter.get("/me/accounts", isLogged, getAccounts);

usersRouter.get("/me/session", isLogged, getSession);

usersRouter.get("/:userId", isLogged, (c) => c.json("OK", 200));

export default usersRouter;
