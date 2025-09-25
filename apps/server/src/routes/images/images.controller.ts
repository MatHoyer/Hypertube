import { TDeleteImageSchemas, TPostImageSchemas } from "@hypertube/libs";
import * as fs from "fs";
import { Context } from "hono";
import i18next from "i18next";
import sharp from "sharp";
import prisma from "../../lib/prisma";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

const getImagePath = (imageId: string) => {
  return `./public/images/${imageId}.webp`;
};

const deleteImageFile = async (imageId: string) => {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });
  if (!image) return { error: i18next.t("images.notFound") };

  const path = getImagePath(image.id);
  if (fs.existsSync(path)) await fs.promises.rm(path);
  await prisma.image.delete({ where: { id: imageId } });
};

export const uploadImage = async (
  c: Context<TIsLogged & TBodyParser<TPostImageSchemas["requirements"]>>
) => {
  const { file } = c.get("validatedBody");
  if (!file.type.startsWith("image/"))
    return c.json({ error: i18next.t("images.invalidFile") }, 400);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const webpBuffer = await sharp(buffer).webp().toBuffer();

    const image = await prisma.image.create({ data: {} });

    const path = getImagePath(image.id);
    await fs.promises.writeFile(path, webpBuffer);

    return c.json(
      { data: { path: getImagePath(image.id), id: image.id } },
      200
    );
  } catch {
    return c.json({ error: i18next.t("images.invalidFile") }, 400);
  }
};

export const deleteImage = async (
  c: Context<TUrlParamsParser<TDeleteImageSchemas["urlParams"]> & TIsLogged>
) => {
  const { imageId } = c.get("validatedUrlParams");

  const res = await deleteImageFile(imageId);

  if (res) return c.json({ error: res.error }, 404);
  return c.json({ data: "OK" }, 200);
};
