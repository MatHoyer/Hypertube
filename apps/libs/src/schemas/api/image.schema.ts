import { z } from "zod";

export const getImageSchemas = {
  urlParams: z.object({ imageId: z.string() }),
  response: z.object({}),
};

export type TGetImageSchemas = {
  urlParams: z.infer<typeof getImageSchemas.urlParams>;
  response: z.infer<typeof getImageSchemas.response>;
};
