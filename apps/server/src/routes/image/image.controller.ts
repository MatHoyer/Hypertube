import { TGetImageSchemas } from "@hypertube/libs";
import * as fs from "fs";
import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";
import { v4 } from "uuid";
import prisma from "../../lib/prisma";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const uploadImage = async (c: Context<BlankEnv, string, BlankInput>) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) return c.json({ error: "No file provided" }, 400);

  // Size : 1 MB
  if (file.size > 1024 * 1024) return c.json({ error: "File too large" }, 413);

  const fileExtension = file.name.split(".").pop();

  const allowedExtensions = ["png", "jpg"];

  if (!allowedExtensions.includes(fileExtension ?? "")) {
    return c.json({ error: "File type not supported" }, 422);
  }

  const path = `./images/${v4()}.${fileExtension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.promises.writeFile(path, buffer);

  const image = await prisma.image.create({
    data: { path: path, updatedAt: new Date() },
  });

  return c.json({ data: image.id }, 200);
};

export const getImage = async (
  c: Context<TUrlParamsParser<TGetImageSchemas["urlParams"]>>
) => {
  const { imageId } = c.get("validatedUrlParams");

  const image = await prisma.image.findUnique({
    where: { id: imageId },
    select: { path: true },
  });

  if (!image || !fs.existsSync(image.path))
    return c.json({ error: "Profile picture not found" }, 404);

  const profilePicture = fs.readFileSync(image.path);

  return c.body(profilePicture, 200, {
    "Content-Type": "image/jpeg",
  });
};

export const deleteImage = async (
  c: Context<TUrlParamsParser<TGetImageSchemas["urlParams"]>>
) => {
  const { imageId } = c.get("validatedUrlParams");

  const image = await prisma.image.findUnique({
    where: { id: imageId },
    select: { path: true },
  });

  if (image && fs.existsSync(image.path))
    fs.rm(image.path, (e) => {
      if (e) return c.json(e.message, 400);
    });

  await prisma.image.delete({ where: { id: imageId } });

  return c.json("OK", 200);
};
