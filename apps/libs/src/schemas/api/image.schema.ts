import { z } from "zod";
import { zfd } from "zod-form-data";

export const postImageSchemas = {
  requirements: zfd.formData({ file: zfd.file() }),
  response: z.object({
    data: z.string().optional(),
    error: z.string().optional(),
  }),
};

export type TPostImageSchemas = {
  requirements: z.infer<typeof postImageSchemas.requirements>;
  response: z.infer<typeof postImageSchemas.response>;
};

export const getImageSchemas = {
  urlParams: z.object({ imageId: z.string() }),
  response: z.object({
    data: z.string().optional(),
    error: z.string().optional(),
  }),
};

export type TGetImageSchemas = {
  urlParams: z.infer<typeof getImageSchemas.urlParams>;
  response: z.infer<typeof getImageSchemas.response>;
};

export const deleteImageSchemas = {
  urlParams: z.object({ imageId: z.string() }),
  response: z.object({
    data: z.string().optional(),
    error: z.string().optional(),
  }),
};

export type TDeleteImageSchemas = {
  urlParams: z.infer<typeof deleteImageSchemas.urlParams>;
  response: z.infer<typeof deleteImageSchemas.response>;
};
