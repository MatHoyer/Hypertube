import {
  hypertubeLogger,
  postImageSchemas,
  TDeleteImageSchemas,
  TPostImageSchemas,
} from "@hypertube/libs";
import { env, prisma } from "@hypertube/server-core";
import * as fs from "fs";
import { Context } from "hono";
import sharp from "sharp";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

const getImagePath = (imageId: string) => {
  if (env.NODE_ENV === "PROD") {
    return `./dist/apps/public/images/${imageId}.webp`;
  }
  return `./public/images/${imageId}.webp`;
};

export const postImage = async (
  c: Context<TIsLogged & TBodyParser<TPostImageSchemas["requirements"]>>
) => {
  const { file } = c.get("validatedBody");

  hypertubeLogger.info(`POST /images ${file.type}`);

  if (!file.type.startsWith("image/")) {
    return c.json({ error: "Invalid file" }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const webpBuffer = await sharp(buffer).webp().toBuffer();

  const image = await prisma.image.create({ data: {} });

  const path = getImagePath(image.id);
  await fs.promises.writeFile(path, webpBuffer);

  return c.json(postImageSchemas.response.parse({ id: image.id }), 200);
};

export const deleteImage = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteImageSchemas["urlParams"]>>
) => {
  const { imageId } = c.get("validatedUrlParams");

  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });
  if (!image) return c.json({ message: "OK" }, 200);

  const path = getImagePath(image.id);
  if (fs.existsSync(path)) await fs.promises.rm(path);
  await prisma.image.delete({ where: { id: imageId } });

  return c.json({ message: "OK" }, 200);
};
