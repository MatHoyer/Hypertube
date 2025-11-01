import {
  getNotificationsSchemas,
  patchNotificationSchemas,
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
  getNotificationsStats,
  patchNotification,
  patchNotifications,
  postSendTestNotification,
} from "./notifications.controller";

const notificationsRouter = new Hono();

notificationsRouter.get(
  "/",
  isLogged,
  searchParamsParser(getNotificationsSchemas.searchParams),
  getNotifications
);

notificationsRouter.patch(
  "/",
  isLogged,
  bodyParser(patchNotificationsSchemas.requirements),
  patchNotifications
);

notificationsRouter.get("/sse", isLogged, getNotificationsSSE);

notificationsRouter.get("/stats", isLogged, getNotificationsStats);

notificationsRouter.patch(
  "/:notificationId",
  isLogged,
  urlParamsParser(patchNotificationSchemas.urlParams),
  bodyParser(patchNotificationsSchemas.requirements),
  patchNotification
);

notificationsRouter.post("/test", isLogged, postSendTestNotification);

export default notificationsRouter;
