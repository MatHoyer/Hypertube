import {
  deleteCredentialsSchemas,
  postCredentialsSchemas,
  postTokenSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { TApiContext } from "../../middlewares/injectApiContext";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  postToken,
} from "./oauth.controller";

export const oauthRouter = new Hono<TApiContext>();

oauthRouter.get("/credentials", isLogged, getCredentials);

oauthRouter.post(
  "/credentials",
  isLogged,
  bodyParser(postCredentialsSchemas.requirements),
  postCredentials
);

oauthRouter.delete(
  "/credentials/:credentialId",
  isLogged,
  urlParamsParser(deleteCredentialsSchemas.urlParams),
  deleteCredentials
);

oauthRouter.post(
  "/token",
  bodyParser(
    postTokenSchemas.requirements,
    "application/x-www-form-urlencoded"
  ),
  postToken
);
