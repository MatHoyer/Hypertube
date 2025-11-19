import { ROUTES, notificationReadStatuses } from "@hypertube/libs";
import type { QueryKey } from "@tanstack/react-query";
import z from "zod";

const apiRouteQueryKeySchemas = {
  [ROUTES.API.MOVIES]: z.object({
    tmdbId: z.number().optional(),
  }),
  [ROUTES.API.NOTIFICATIONS]: z.object({
    type: z
      .union([z.enum(notificationReadStatuses), z.literal("stats")])
      .optional(),
  }),
  [ROUTES.API.OAUTH_CREDENTIALS]: z.object({}),
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
  [ROUTES.API.MOVIES]: ({ tmdbId }) => {
    return tmdbId ? [ROUTES.API.MOVIES, tmdbId] : [ROUTES.API.MOVIES];
  },
  [ROUTES.API.NOTIFICATIONS]: ({ type }) => {
    if (!type) return [ROUTES.API.NOTIFICATIONS];
    return type === "stats"
      ? [ROUTES.API.NOTIFICATIONS, "stats"]
      : [ROUTES.API.NOTIFICATIONS, type];
  },
  [ROUTES.API.OAUTH_CREDENTIALS]: () => [ROUTES.API.OAUTH_CREDENTIALS],
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
