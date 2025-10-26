import {
  getNotificationsSchemas,
  patchNotificationsSchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getNotifications,
  getNotificationsSSE,
} from "./notifications.controller";

const notificationsRouter = new Hono();

notificationsRouter.get(
  "/",
  isLogged,
  searchParamsParser(getNotificationsSchemas.searchParams),
  getNotifications
);

notificationsRouter.get("/sse", isLogged, getNotificationsSSE);

notificationsRouter.patch(
  "/:notificationId",
  isLogged,
  urlParamsParser(patchNotificationsSchemas.urlParams),
  bodyParser(patchNotificationsSchemas.requirements)
);

export default notificationsRouter;
