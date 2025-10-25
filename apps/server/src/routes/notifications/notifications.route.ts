import { Hono } from "hono";
import { isLogged } from "../../middlewares/isLogged";
import { getNotificationsSSE } from "./notifications.controller";

const notificationsRouter = new Hono();

notificationsRouter.get("/", isLogged, getNotificationsSSE);

export default notificationsRouter;
