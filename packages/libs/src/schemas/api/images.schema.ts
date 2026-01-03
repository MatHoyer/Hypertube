import { z } from "zod";
import { sizeMaxFile } from "../../const/global.const.js";
import { imageSchema } from "../database/image.schema.js";

export const postImageSchemas = {
  requirements: z.object({ file: z.file().max(sizeMaxFile) }),
  response: z.object({
    data: z.object({ path: z.string(), id: z.uuid() }).optional(),
    error: z.string().optional(),
  }),
};

export type TPostImageSchemas = {
  requirements: z.infer<typeof postImageSchemas.requirements>;
  response: z.infer<typeof postImageSchemas.response>;
};

export const deleteImageSchemas = {
  urlParams: z.object({ imageId: imageSchema.shape.id }),
  response: z.object({
    data: z.string().optional(),
    error: z.string().optional(),
  }),
};

export type TDeleteImageSchemas = {
  urlParams: z.infer<typeof deleteImageSchemas.urlParams>;
  response: z.infer<typeof deleteImageSchemas.response>;
};
