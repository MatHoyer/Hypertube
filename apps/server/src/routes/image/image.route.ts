import { getImageSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { isLogged } from "../../middlewares/isLogged";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { deleteImage, getImage, uploadImage } from "./image.controller";

const imageRouter = new Hono();

imageRouter.post(
  "/",
  bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) => {
      return c.json({ error: "File too large" }, 413);
    },
  }),
  isLogged(),
  uploadImage
);

imageRouter.get(
  "/:imageId",
  urlParamsParser(getImageSchemas.urlParams),
  getImage
);

imageRouter.delete(
  "/:imageId",
  urlParamsParser(getImageSchemas.urlParams),
  isLogged(),
  deleteImage
);

export default imageRouter;
