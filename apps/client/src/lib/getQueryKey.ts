import { API_ROUTES, notificationReadStatuses } from "@hypertube/libs";
import type { QueryKey } from "@tanstack/react-query";
import z from "zod";

const apiRouteQueryKeySchemas = {
  [API_ROUTES.API_MOVIES]: z.object({
    tmdbId: z.number().optional(),
  }),
  [API_ROUTES.API_NOTIFICATIONS]: z.object({
    type: z
      .union([z.enum(notificationReadStatuses), z.literal("stats")])
      .optional(),
  }),
  [API_ROUTES.API_OAUTH_CREDENTIALS]: z.object({}),
};

type TApiRouteDataRequirements = {
  [T in keyof typeof apiRouteQueryKeySchemas]: z.infer<
    (typeof apiRouteQueryKeySchemas)[T]
  >;
};

type TRoute = keyof TApiRouteDataRequirements;

type TRouteDataMap<T extends TRoute> = T extends keyof TApiRouteDataRequirements
  ? TApiRouteDataRequirements[T]
  : never;

const queryKeys: {
  [T in TRoute]: (params: TRouteDataMap<T>) => QueryKey;
} = {
  [API_ROUTES.API_MOVIES]: ({ tmdbId }) => {
    return tmdbId ? [API_ROUTES.API_MOVIES, tmdbId] : [API_ROUTES.API_MOVIES];
  },
  [API_ROUTES.API_NOTIFICATIONS]: ({ type }) => {
    if (!type) return [API_ROUTES.API_NOTIFICATIONS];
    return type === "stats"
      ? [API_ROUTES.API_NOTIFICATIONS, "stats"]
      : [API_ROUTES.API_NOTIFICATIONS, type];
  },
  [API_ROUTES.API_OAUTH_CREDENTIALS]: () => [API_ROUTES.API_OAUTH_CREDENTIALS],
};

export const getQueryKey = <T extends TRoute>(
  route: T,
  params?: TRouteDataMap<T>
) => {
  const schema = apiRouteQueryKeySchemas[route];
  const parsedParams = schema.parse(
    params ?? {}
  ) as TApiRouteDataRequirements[T];

  const queryKeyFn = queryKeys[route] as (
    params: TApiRouteDataRequirements[T]
  ) => QueryKey;

  return queryKeyFn(parsedParams);
};
