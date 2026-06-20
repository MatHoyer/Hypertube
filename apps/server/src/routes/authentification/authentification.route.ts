import {
  emailVerificationAuthentificationSchemas,
  linkProviderAuthentificationSchemas,
  requestPasswordResetAuthentificationSchemas,
  resetPasswordAuthentificationSchemas,
  signInAuthentificationSchemas,
  signUpAuthentificationSchemas,
  unlinkProviderAuthentificationSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { TApiContext } from "../../middlewares/injectApiContext";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  emailVerification,
  linkProvider,
  requestPasswordReset,
  resetPassword,
  signIn,
  signInSocial,
  signOut,
  signUp,
  unlinkProvider,
} from "./authentification.controller";

const authentificationRouter = new Hono<TApiContext>();

authentificationRouter.post(
  "/sign-up",
  bodyParser(signUpAuthentificationSchemas.requirements),
  signUp
);

authentificationRouter.post(
  "/sign-in",
  bodyParser(signInAuthentificationSchemas.requirements),
  signIn
);

authentificationRouter.post(
  "/sign-in-social",
  bodyParser(linkProviderAuthentificationSchemas.requirements),
  signInSocial
);

authentificationRouter.post(
  "/request-password-reset",
  bodyParser(requestPasswordResetAuthentificationSchemas.requirements),
  requestPasswordReset
);

authentificationRouter.post(
  "/reset-password",
  bodyParser(resetPasswordAuthentificationSchemas.requirements),
  resetPassword
);

authentificationRouter.post("/sign-out", isLogged, signOut);

authentificationRouter.get(
  "/email-verification",
  searchParamsParser(emailVerificationAuthentificationSchemas.searchParams),
  emailVerification
);

authentificationRouter.post(
  "/link",
  isLogged,
  bodyParser(linkProviderAuthentificationSchemas.requirements),
  linkProvider
);

authentificationRouter.delete(
  "/link/:providerId",
  isLogged,
  urlParamsParser(unlinkProviderAuthentificationSchemas.urlParams),
  unlinkProvider
);

export default authentificationRouter;
