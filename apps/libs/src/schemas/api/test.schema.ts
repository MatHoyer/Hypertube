import z from "zod";

export const testSchemas = {
  requirements: z.object({
    id: z.number(),
  }),
  response: z.object({
    id: z.string(),
  }),
};
export type TTestSchemas = {
  requirements: z.infer<typeof testSchemas.requirements>;
  response: z.infer<typeof testSchemas.response>;
};
