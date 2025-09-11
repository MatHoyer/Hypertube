import { getImageSchemas } from "@hypertube/libs";
import { Hono } from "hono";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import { deleteImage, getImage, uploadImage } from "./image.controller";

const imageRouter = new Hono();

imageRouter.post("/upload", uploadImage);

imageRouter.get(
  "/get/:imageId",
  urlParamsParser(getImageSchemas.urlParams),
  getImage
);

imageRouter.get(
  "/delete/:imageId",
  urlParamsParser(getImageSchemas.urlParams),
  deleteImage
);

export default imageRouter;
