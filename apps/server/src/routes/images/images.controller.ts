import {
  hypertubeLogger,
  postImageSchemas,
  TDeleteImageSchemas,
  TPostImageSchemas,
} from "@hypertube/libs";
import { BUCKETS, minio, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import sharp from "sharp";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

const getImagePath = (imageId: string) => `${imageId}.webp`;

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

  let webpBuffer;
  try {
    const sharpImage = sharp(buffer);
    await sharpImage.metadata();

    webpBuffer = await sharpImage.webp().toBuffer();
  } catch (e) {
    if (e instanceof Error) return c.json({ error: e.message }, 400);
    return c.json({ error: "Unexpected error" }, 400);
  }
  const image = await prisma.image.create({ data: {} });

  await minio.putObject(
    BUCKETS.IMAGES,
    getImagePath(image.id),
    webpBuffer,
    webpBuffer.length,
    { "Content-Type": "image/webp" }
  );

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

  await minio.removeObject(BUCKETS.IMAGES, getImagePath(image.id));
  await prisma.image.delete({ where: { id: imageId } });

  return c.json({ message: "OK" }, 200);
};
