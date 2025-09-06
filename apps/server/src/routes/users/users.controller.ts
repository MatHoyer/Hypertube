import * as fs from "fs";
import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";
import { v4 } from "uuid";
import z from "zod";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getProfilePictureSchemas = {
  urlParams: z.object({ pictureName: z.string() }),
  response: z.object({}),
};

export type TGetProfilePictureSchemas = {
  urlParams: z.infer<typeof getProfilePictureSchemas.urlParams>;
  response: z.infer<typeof getProfilePictureSchemas.response>;
};

export const updateProfilePicture = async (
  c: Context<BlankEnv, string, BlankInput>
) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) return c.json({ error: "No file provided" }, 400);

  const newFileName = `${v4()}_${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.promises.writeFile(`./profile-pictures/${newFileName}`, buffer);
  return c.json({ data: newFileName }, 200);
};

export const getProfilePicture = async (
  c: Context<TUrlParamsParser<TGetProfilePictureSchemas["urlParams"]>>
) => {
  const { pictureName } = c.get("validatedUrlParams");
  const path = `./profile-pictures/${pictureName}`;

  if (!fs.existsSync(path))
    return c.json({ error: "Profile picture not found" }, 400);

  const profilePicture = fs.readFileSync(path);

  return c.body(profilePicture, 200, {
    "Content-Type": "image/jpeg",
  });
};
