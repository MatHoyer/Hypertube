import { API_ROUTES } from "@hypertube/libs";
import z from "zod";

const apiRouteQueryKeySchemas = {
  [API_ROUTES.API_MOVIES]: z.object({
    tmdbId: z.number().optional(),
  }),
};

type TApiRouteQueryKeySchemas = {
  [API_ROUTES.API_MOVIES]: z.infer<
    (typeof apiRouteQueryKeySchemas)[typeof API_ROUTES.API_MOVIES]
  >;
};

const queryKeys = {
  [API_ROUTES.API_MOVIES]: (
    params: TApiRouteQueryKeySchemas[typeof API_ROUTES.API_MOVIES]
  ) => {
    return params.tmdbId
      ? [API_ROUTES.API_MOVIES, params.tmdbId]
      : [API_ROUTES.API_MOVIES];
  },
};

export const getQueryKey = <T extends keyof typeof apiRouteQueryKeySchemas>(
  route: T,
  params: T extends keyof TApiRouteQueryKeySchemas
    ? TApiRouteQueryKeySchemas[T]
    : never
) => {
  const schema = apiRouteQueryKeySchemas[route];
  const parsedParams = schema.parse(params);

  return queryKeys[route](parsedParams);
};
