import { TGetImageSchemas } from "@hypertube/libs";
import * as fs from "fs";
import { Context } from "hono";
import i18next from "i18next";
import sharp from "sharp";
import prisma from "../../lib/prisma";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

const getImagePath = (imageId: string) => {
  return `./images/${imageId}.webp`;
};

const deleteImageFile = async (
  imageId: string,
  user?: { id: string; image: string | null }
) => {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });

  if (!image) return { error: i18next.t("images.notFound") };

  const path = getImagePath(image.id);

  if (!fs.existsSync(path)) return { error: i18next.t("images.notFound") };

  fs.rm(path, (e) => {
    return { error: e?.message ?? i18next.t("images.deleteFail") };
  });

  await prisma.image.delete({ where: { id: imageId } });

  if (!user) return;

  if (imageId === user.image)
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

  return;
};

export const uploadImage = async (c: Context<TIsLogged>) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const user = c.get("user");

  if (!file || !(file instanceof File))
    return c.json({ error: i18next.t("images.invalidFile") }, 400);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const webpBuffer = await sharp(buffer).webp().toBuffer();

    const image = await prisma.image.create({ data: {} });

    const path = getImagePath(image.id);
    await fs.promises.writeFile(path, webpBuffer);

    if (user.image) await deleteImageFile(user.image);

    return c.json({ data: image.id }, 200);
  } catch {
    return c.json({ error: i18next.t("images.invalidFile") }, 400);
  }
};

export const getImage = async (
  c: Context<TUrlParamsParser<TGetImageSchemas["urlParams"]>>
) => {
  const { imageId } = c.get("validatedUrlParams");

  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });

  if (!image) return c.json({ error: i18next.t("images.notFound") }, 404);

  const path = getImagePath(image.id);

  if (!fs.existsSync(path))
    return c.json({ error: i18next.t("images.notFound") }, 404);

  const profilePicture = fs.readFileSync(path);

  return c.body(profilePicture, 200, {
    "Content-Type": "image/webp",
  });
};

export const deleteImage = async (
  c: Context<TUrlParamsParser<TGetImageSchemas["urlParams"]> & TIsLogged>
) => {
  const { imageId } = c.get("validatedUrlParams");
  const user = c.get("user");

  const res = await deleteImageFile(imageId, {
    id: user.id,
    image: user.image ?? null,
  });

  if (res) return c.json({ error: res.error }, 404);

  return c.json({ data: "OK" }, 200);
};
