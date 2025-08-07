import z from "zod";

export const ytsMovieSchemas = z.object({
  title: z.string(),
  link: z.string(),
  image: z.string(),
});
export type TYtsMovieSchemas = z.infer<typeof ytsMovieSchemas>;

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
  response: z.object({
    movies: z.array(ytsMovieSchemas),
  }),
};
export type TPostYtsFiltersSchemas = {
  requirements: z.infer<typeof postYtsFiltersSchemas.requirements>;
  response: z.infer<typeof postYtsFiltersSchemas.response>;
};

export const getYtsPaginationSchemas = {
  searchParams: z.record(z.string(), z.string()),
  response: z.object({
    maxPagination: z.coerce.number().int().positive(),
  }),
};
export type TGetYtsPaginationSchemas = {
  searchParams: z.infer<typeof getYtsPaginationSchemas.searchParams>;
  response: z.infer<typeof getYtsPaginationSchemas.response>;
};
