import {
  ROUTES,
  commentSchema,
  getMoviesSchemas,
  movieSchema,
  notificationReadStatuses,
  tmdbGenres,
  typedKeys,
  userSchema,
} from "@hypertube/libs";
import type { QueryKey } from "@tanstack/react-query";
import z from "zod";

const apiRouteQueryKeySchemas = {
  [ROUTES.API.USERS]: z.object({ userId: userSchema.shape.id }),
  [ROUTES.API.USERS_SESSION]: z.object({}),
  [ROUTES.API.USERS_ACCOUNTS]: z.object({}),
  [ROUTES.API.MOVIES]: z.object({
    tmdbId: z.number().optional(),
    searchParams: z
      .object({
        ...getMoviesSchemas.searchParams.shape,
        page: getMoviesSchemas.searchParams.shape.page.optional(),
        input: z.string().nullable().optional(),
        genres: z.array(z.enum(typedKeys(tmdbGenres))).optional(),
      })
      .optional(),
  }),
  [ROUTES.API.NOTIFICATIONS]: z.object({
    type: z
      .union([z.enum(notificationReadStatuses), z.literal("stats")])
      .optional(),
  }),
  [ROUTES.API.OAUTH_CREDENTIALS]: z.object({}),
  [ROUTES.API.MOVIES_COMMENT]: z.object({
    tmdbId: movieSchema.shape.tmdbId,
  }),
  [ROUTES.API.COMMENTS_REPLIES]: z.object({
    commentId: commentSchema.shape.id,
  }),
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
  [ROUTES.API.USERS]: ({ userId }) => [ROUTES.API.USERS, userId],
  [ROUTES.API.USERS_SESSION]: () => [ROUTES.API.USERS_SESSION],
  [ROUTES.API.USERS_ACCOUNTS]: () => [ROUTES.API.USERS_ACCOUNTS],
  [ROUTES.API.MOVIES]: ({ tmdbId, searchParams }) => {
    if (tmdbId && searchParams) {
      throw new Error("tmdbId and searchParams are incomptatible");
    }
    if (searchParams) return [ROUTES.API.MOVIES, searchParams];
    if (tmdbId) return [ROUTES.API.MOVIES, tmdbId];
    return [ROUTES.API.MOVIES];
  },
  [ROUTES.API.NOTIFICATIONS]: ({ type }) => {
    if (!type) return [ROUTES.API.NOTIFICATIONS];
    return type === "stats"
      ? [ROUTES.API.NOTIFICATIONS, "stats"]
      : [ROUTES.API.NOTIFICATIONS, type];
  },
  [ROUTES.API.OAUTH_CREDENTIALS]: () => [ROUTES.API.OAUTH_CREDENTIALS],
  [ROUTES.API.MOVIES_COMMENT]: ({ tmdbId }) => [
    ROUTES.API.MOVIES_COMMENT,
    tmdbId,
  ],
  [ROUTES.API.COMMENTS_REPLIES]: ({ commentId }) => [
    ROUTES.API.COMMENTS_REPLIES,
    commentId,
  ],
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
