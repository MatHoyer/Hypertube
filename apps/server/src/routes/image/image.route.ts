import {
  deleteImageSchemas,
  postImageSchemas,
  sizeMaxFile,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { deleteImage, uploadImage } from "./image.controller";

const imageRouter = new Hono();

imageRouter.post(
  "/",
  bodyLimit({
    maxSize: sizeMaxFile,
    onError: (c) => {
      return c.json({ error: "File too large" }, 413);
    },
  }),
  isLogged(),
  bodyParser(postImageSchemas.requirements, "formData"),
  uploadImage
);

imageRouter.delete(
  "/:imageId",
  urlParamsParser(deleteImageSchemas.urlParams),
  isLogged(),
  deleteImage
);

export default imageRouter;
