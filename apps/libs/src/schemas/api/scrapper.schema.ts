import z from "zod";

export const getYtsFiltersSchemas = {
  response: z.object({
    filters: z.record(z.string(), z.array(z.string())),
  }),
};
export type TGetYtsFiltersSchemas = {
  response: z.infer<typeof getYtsFiltersSchemas.response>;
};

export const postYtsFiltersSchemas = {
  requirements: z.object({
    filters: z.record(z.string(), z.string()),
  }),
};
export type TPostYtsFiltersSchemas = {
  requirements: z.infer<typeof postYtsFiltersSchemas.requirements>;
};
