import { Hono } from "hono";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  getProfilePicture,
  getProfilePictureSchemas,
  updateProfilePicture,
} from "./users.controller";

const usersRouter = new Hono();

usersRouter.put("/upload-picture", updateProfilePicture);

usersRouter.get(
  "/get-picture/:pictureName",
  urlParamsParser(getProfilePictureSchemas.urlParams),
  getProfilePicture
);

export default usersRouter;
