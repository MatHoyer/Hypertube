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
import { deleteImage, uploadImage } from "./images.controller";

const imagesRouter = new Hono();

imagesRouter.post(
  "/",
  isLogged(),
  bodyLimit({
    maxSize: sizeMaxFile,
    onError: (c) => {
      return c.json({ error: "File too large" }, 413);
    },
  }),
  bodyParser(postImageSchemas.requirements, "formData"),
  uploadImage
);

imagesRouter.delete(
  "/:imageId",
  isLogged(),
  urlParamsParser(deleteImageSchemas.urlParams),
  deleteImage
);

export default imagesRouter;
