import z from "zod";
import {
  betterAuthProviders,
  languageCodes,
} from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import { commentSchema } from "../../schemas/database/comments.schema.js";
import { credentialSchema } from "../../schemas/database/credential.schema.js";
import { imageSchema } from "../../schemas/database/image.schema.js";
import { movieSchema } from "../../schemas/database/movie.schema.js";
import { notificationSchema } from "../../schemas/database/notifications.schema.js";
import { playlistSchema } from "../../schemas/database/playlist.schema.js";
import { userSchema } from "../../schemas/database/user.schema.js";
import { isPurObject, typedEntries } from "../object.utils.js";
import { getClientUrl } from "./getClientUrl.js";
import { getServerUrl } from "./getServerUrl.js";

export const ROUTES = {
  CLIENT: {
    HOME: "client-home",
    SIGNIN: "client-signin",
    SIGNUP: "client-signup",
    FORGET_PASSWORD: "client-forget-password",
    RESET_PASSWORD: "client-reset-password",
    SETTINGS: "client-settings",
    MOVIE: "client-movie",
    OAUTH_CREDENTIALS: "client-oauth-credentials",
    ERROR: "client-error",
    NOTIFICATIONS: "client-notifications",
    PROFILE: "client-profile",
  },
  API: {
    SWAGGER: "api-swagger",
    HEALTH: "api-health",
    AUTH: "api-auth",
    AUTHENTIFICATION: "api-authentification",
    AUTHENTIFICATION_SIGNUP: "api-authentification-signup",
    AUTHENTIFICATION_SIGNIN: "api-authentification-signin",
    AUTHENTIFICATION_SIGNIN_SOCIAL: "api-authentification-signin-social",
    AUTHENTIFICATION_REQUEST_PASSWORD_RESET:
      "api-authentification-request-password-reset",
    AUTHENTIFICATION_RESET_PASSWORD: "api-authentification-reset-password",
    AUTHENTIFICATION_SIGNOUT: "api-authentification-signout",
    AUTHENTIFICATION_EMAIL_VERIFICATION:
      "api-authentification-email-verification",
    AUTHENTIFICATION_LINK: "api-authentification-link",
    OAUTH_CREDENTIALS: "api-oauth-credentials",
    USERS: "api-users",
    USERS_ACCOUNTS: "api-users-accounts",
    USERS_SESSION: "api-users-session",
    IMAGES: "api-images",
    MOVIES: "api-movies",
    MOVIES_SUBSCRIPTION: "api-movies-subscription",
    PLAYLISTS: "api-playlists",
    PLAYLISTS_MOVIE: "api-playlists-movie",
    NOTIFICATIONS: "api-notifications",
    NOTIFICATIONS_STATS: "api-notifications-stats",
    NOTIFICATIONS_TEST: "api-notifications-test",
    STREAMING_MOVIE_RESOLUTION: "api-streaming-movie-resolution",
    STREAMING_MOVIE_SUBTITLES: "api-streaming-movie-subtitles",
    SSE_MOVIES: "sse-movies",
    SSE_NOTIFICATIONS: "sse-notifications",
    MOVIES_LIKE: "api-movies-like",
    MOVIES_COMMENT: "api-movies-comment",
    COMMENTS: "api-comments",
    COMMENTS_REPLIES: "api-comments-replies",
    COMMENTS_LIKES: "api-comments-like",
    HISTORY: "api-history",
    MOVIES_WATCH_TIMER: "api-movies-watch-timer",
    MOVIES_CASTING: "api-movies-casting",
  },
  EXTERNAL: {
    IMDB_MOVIE: "external-imdb-movie",
    IMDB_ACTOR: "external-imdb-actor",
  },
} as const;

type TRoutes = typeof ROUTES;
export type TClientRoute = TRoutes["CLIENT"][keyof TRoutes["CLIENT"]];
export type TAPIRoute = TRoutes["API"][keyof TRoutes["API"]];
export type TExternalRoute = TRoutes["EXTERNAL"][keyof TRoutes["EXTERNAL"]];

// Use z.object({}) to make undefined

const routeSchemas = {
  CLIENT: {
    [ROUTES.CLIENT.HOME]: z.object({}),
    [ROUTES.CLIENT.SIGNIN]: z.object({}),
    [ROUTES.CLIENT.SIGNUP]: z.object({}),
    [ROUTES.CLIENT.FORGET_PASSWORD]: z.object({}),
    [ROUTES.CLIENT.RESET_PASSWORD]: z.object({}),
    [ROUTES.CLIENT.SETTINGS]: z.object({}),
    [ROUTES.CLIENT.MOVIE]: z.object({
      tmdbId: z.union([movieSchema.shape.tmdbId, z.literal(":tmdbId")]),
    }),
    [ROUTES.CLIENT.OAUTH_CREDENTIALS]: z.object({}),
    [ROUTES.CLIENT.ERROR]: z.object({}),
    [ROUTES.CLIENT.NOTIFICATIONS]: z.object({}),
    [ROUTES.CLIENT.PROFILE]: z.object({
      userId: z.union([userSchema.shape.id, z.literal(":userId")]),
    }),
  },
  API: {
    [ROUTES.API.SWAGGER]: z.object({
      mode: z.union([z.literal("doc"), z.literal("ui")]).optional(),
    }),
    [ROUTES.API.HEALTH]: z.object({}),
    [ROUTES.API.AUTH]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_SIGNUP]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_SIGNIN]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_SIGNIN_SOCIAL]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_REQUEST_PASSWORD_RESET]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_RESET_PASSWORD]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_SIGNOUT]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_EMAIL_VERIFICATION]: z.object({}),
    [ROUTES.API.AUTHENTIFICATION_LINK]: z.object({
      providerId: z
        .union([z.enum(betterAuthProviders), z.literal("{providerId}")])
        .optional(),
    }),
    [ROUTES.API.OAUTH_CREDENTIALS]: z.object({
      credentialId: z
        .union([credentialSchema.shape.id, z.literal("{credentialId}")])
        .optional(),
    }),
    [ROUTES.API.USERS]: z.object({
      userId: z.union([userSchema.shape.id, z.literal("{userId}")]).optional(),
    }),
    [ROUTES.API.USERS_ACCOUNTS]: z.object({}),
    [ROUTES.API.USERS_SESSION]: z.object({}),
    [ROUTES.API.IMAGES]: z.object({
      imageId: z
        .union([imageSchema.shape.id, z.literal("{imageId}")])
        .optional(),
    }),
    [ROUTES.API.MOVIES]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
      resolution: z
        .union([z.enum(ytsQualities), z.literal("{resolution}")])
        .optional(),
      subtitlesLanguage: z
        .union([z.enum(languageCodes), z.literal("{subtitlesLanguage}")])
        .optional(),
    }),
    [ROUTES.API.MOVIES_SUBSCRIPTION]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
    }),
    [ROUTES.API.PLAYLISTS]: z.object({
      playlistId: z
        .union([playlistSchema.shape.id, z.literal("{playlistId}")])
        .optional(),
    }),
    [ROUTES.API.PLAYLISTS_MOVIE]: z.object({
      playlistId: z.union([playlistSchema.shape.id, z.literal("{playlistId}")]),
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
    }),
    [ROUTES.API.NOTIFICATIONS]: z.object({
      notificationId: z
        .union([notificationSchema.shape.id, z.literal("{notificationId}")])
        .optional(),
    }),
    [ROUTES.API.NOTIFICATIONS_STATS]: z.object({}),
    [ROUTES.API.NOTIFICATIONS_TEST]: z.object({}),
    [ROUTES.API.SSE_MOVIES]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
    }),
    [ROUTES.API.SSE_NOTIFICATIONS]: z.object({}),
    [ROUTES.API.STREAMING_MOVIE_RESOLUTION]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
      resolution: z
        .union([z.enum(ytsQualities), z.literal("{resolution}")])
        .optional(),
    }),
    [ROUTES.API.STREAMING_MOVIE_SUBTITLES]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
      subtitlesLanguage: z
        .union([
          z.enum(languageCodes),
          z.literal("{subtitlesLanguage}"),
          z.string(),
        ])
        .optional(),
    }),
    [ROUTES.API.MOVIES_LIKE]: z.object({
      tmdbId: z.union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")]),
    }),
    [ROUTES.API.MOVIES_COMMENT]: z.object({
      tmdbId: z.union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")]),
      commentId: z
        .union([commentSchema.shape.id, z.literal("{commentId}")])
        .optional(),
    }),
    [ROUTES.API.COMMENTS]: z.object({
      commentId: z
        .union([commentSchema.shape.id, z.literal("{commentId}")])
        .optional(),
    }),
    [ROUTES.API.COMMENTS_REPLIES]: z.object({
      commentId: z.union([commentSchema.shape.id, z.literal("{commentId}")]),
    }),
    [ROUTES.API.COMMENTS_LIKES]: z.object({
      commentId: z.union([commentSchema.shape.id, z.literal("{commentId}")]),
    }),
    [ROUTES.API.HISTORY]: z.object({
      tmdbId: z
        .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
        .optional(),
    }),
    [ROUTES.API.MOVIES_WATCH_TIMER]: z.object({
      tmdbId: z.union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")]),
    }),
    [ROUTES.API.MOVIES_CASTING]: z.object({
      tmdbId: z.union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")]),
    }),
  },
  EXTERNAL: {
    [ROUTES.EXTERNAL.IMDB_MOVIE]: z.object({
      imdbId: z.string(),
    }),
    [ROUTES.EXTERNAL.IMDB_ACTOR]: z.object({
      imdbId: z.string(),
    }),
  },
};

type TClientRouteDataRequirements = {
  [T in keyof typeof routeSchemas.CLIENT]: z.infer<
    (typeof routeSchemas.CLIENT)[T]
  >;
};

type TApiRouteDataRequirements = {
  [T in keyof typeof routeSchemas.API]: z.infer<(typeof routeSchemas.API)[T]>;
};

type TExternalRouteDataRequirements = {
  [T in keyof typeof routeSchemas.EXTERNAL]: z.infer<
    (typeof routeSchemas.EXTERNAL)[T]
  >;
};

type TRouteDataRequirements = TClientRouteDataRequirements &
  TApiRouteDataRequirements &
  TExternalRouteDataRequirements;

type TRoute = keyof TRouteDataRequirements;

type TRouteDataMap<T extends TRoute> = T extends keyof TRouteDataRequirements
  ? TRouteDataRequirements[T]
  : never;

const routes: {
  [T in TRoute]: (params: TRouteDataMap<T>) => string;
} = {
  // Client routes
  [ROUTES.CLIENT.HOME]: () => "/",
  [ROUTES.CLIENT.SIGNIN]: () => "/sign-in",
  [ROUTES.CLIENT.SIGNUP]: () => "/sign-up",
  [ROUTES.CLIENT.FORGET_PASSWORD]: () => "/forget-password",
  [ROUTES.CLIENT.RESET_PASSWORD]: () => "/reset-password",
  [ROUTES.CLIENT.SETTINGS]: () => "/profile/settings",
  [ROUTES.CLIENT.MOVIE]: ({ tmdbId }) => `/movie/${tmdbId}`,
  [ROUTES.CLIENT.OAUTH_CREDENTIALS]: () => "/credentials",
  [ROUTES.CLIENT.ERROR]: () => "/error",
  [ROUTES.CLIENT.NOTIFICATIONS]: () => "/notifications",
  [ROUTES.CLIENT.PROFILE]: ({ userId }) => `/profile/${userId}`,

  // API routes
  [ROUTES.API.SWAGGER]: ({ mode }) =>
    mode ? `/api/swagger/${mode}` : "/api/swagger",
  [ROUTES.API.HEALTH]: () => "/api/health",

  [ROUTES.API.AUTH]: () => "/api/auth",
  [ROUTES.API.AUTHENTIFICATION]: () => "/api/authentification",
  [ROUTES.API.AUTHENTIFICATION_SIGNUP]: () => "/api/authentification/sign-up",
  [ROUTES.API.AUTHENTIFICATION_SIGNIN]: () => "/api/authentification/sign-in",
  [ROUTES.API.AUTHENTIFICATION_SIGNIN_SOCIAL]: () =>
    "/api/authentification/sign-in-social",
  [ROUTES.API.AUTHENTIFICATION_REQUEST_PASSWORD_RESET]: () =>
    "/api/authentification/request-password-reset",
  [ROUTES.API.AUTHENTIFICATION_RESET_PASSWORD]: () =>
    "/api/authentification/reset-password",
  [ROUTES.API.AUTHENTIFICATION_SIGNOUT]: () => "/api/authentification/sign-out",
  [ROUTES.API.AUTHENTIFICATION_EMAIL_VERIFICATION]: () =>
    `/api/authentification/email-verification`,
  [ROUTES.API.AUTHENTIFICATION_LINK]: ({ providerId }) =>
    providerId
      ? `/api/authentification/link/${providerId}`
      : "/api/authentification/link",
  [ROUTES.API.OAUTH_CREDENTIALS]: ({ credentialId }) =>
    credentialId
      ? `/api/oauth/credentials/${credentialId}`
      : "/api/oauth/credentials",

  [ROUTES.API.USERS]: ({ userId }) =>
    userId ? `/api/users/${userId}` : "/api/users",
  [ROUTES.API.USERS_ACCOUNTS]: () => "/api/users/me/accounts",
  [ROUTES.API.USERS_SESSION]: () => "/api/users/me/session",

  [ROUTES.API.IMAGES]: ({ imageId }) =>
    imageId ? `/api/images/${imageId}` : "/api/images",

  [ROUTES.API.MOVIES]: ({ tmdbId, resolution, subtitlesLanguage }) => {
    if (resolution && subtitlesLanguage) {
      throw new Error(
        "Resolution and subtitles language cannot be provided together"
      );
    }
    if (tmdbId === undefined) return `/api/movies`;

    if (resolution) {
      return `/api/movies/${tmdbId}/resolutions/${resolution}/download`;
    } else if (subtitlesLanguage) {
      return `/api/movies/${tmdbId}/subtitles/${subtitlesLanguage}/download`;
    } else {
      return `/api/movies/${tmdbId}`;
    }
  },
  [ROUTES.API.MOVIES_SUBSCRIPTION]: ({ tmdbId }) =>
    `/api/movies/${tmdbId}/subscription`,

  [ROUTES.API.PLAYLISTS]: ({ playlistId }) =>
    playlistId ? `/api/playlists/${playlistId}` : "/api/playlists",
  [ROUTES.API.PLAYLISTS_MOVIE]: ({ playlistId, tmdbId }) =>
    tmdbId
      ? `/api/playlists/${playlistId}/movie/${tmdbId}`
      : `/api/playlists/${playlistId}/movie`,

  [ROUTES.API.NOTIFICATIONS]: ({ notificationId }) =>
    notificationId
      ? `/api/notifications/${notificationId}`
      : "/api/notifications",
  [ROUTES.API.NOTIFICATIONS_STATS]: () => "/api/notifications/stats",
  [ROUTES.API.NOTIFICATIONS_TEST]: () => "/api/notifications/test",

  [ROUTES.API.MOVIES_LIKE]: ({ tmdbId }) => `/api/movies/${tmdbId}/like`,

  [ROUTES.API.MOVIES_COMMENT]: ({ tmdbId, commentId }) =>
    commentId
      ? `/api/movies/${tmdbId}/comments/${commentId}`
      : `/api/movies/${tmdbId}/comments`,

  [ROUTES.API.COMMENTS]: ({ commentId }) =>
    commentId ? `/api/comments/${commentId}` : "/api/comments",

  [ROUTES.API.COMMENTS_REPLIES]: ({ commentId }) =>
    `/api/comments/${commentId}/replies`,

  [ROUTES.API.COMMENTS_LIKES]: ({ commentId }) =>
    `/api/comments/${commentId}/like`,
  // SSE routes
  [ROUTES.API.SSE_MOVIES]: ({ tmdbId }) => `/api/movies/${tmdbId}/sse`,
  [ROUTES.API.SSE_NOTIFICATIONS]: () => "/api/notifications/sse",

  // Streaming routes
  [ROUTES.API.STREAMING_MOVIE_RESOLUTION]: ({ tmdbId, resolution }) =>
    `/api/streaming/movie/${tmdbId}/resolution/${resolution}`,
  [ROUTES.API.STREAMING_MOVIE_SUBTITLES]: ({ tmdbId, subtitlesLanguage }) =>
    `/api/streaming/movie/${tmdbId}/subtitles/${subtitlesLanguage}`,

  [ROUTES.API.HISTORY]: ({ tmdbId }) =>
    tmdbId ? `/api/history/${tmdbId}` : `/api/history`,

  [ROUTES.API.MOVIES_WATCH_TIMER]: ({ tmdbId }) =>
    `/api/movies/${tmdbId}/watch-timer`,
  [ROUTES.API.MOVIES_CASTING]: ({ tmdbId }) => `/api/movies/${tmdbId}/casting`,

  // External routes
  [ROUTES.EXTERNAL.IMDB_MOVIE]: ({ imdbId }) =>
    `https://www.imdb.com/title/${imdbId}`,
  [ROUTES.EXTERNAL.IMDB_ACTOR]: ({ imdbId }) =>
    `https://www.imdb.com/name/nm${imdbId}`,
};

type TSearchParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

type TSearchParamsProvided =
  | string[][]
  | Record<string, string | null | undefined>
  | string
  | URLSearchParams;

type TGetUrlArgs<T extends TRoute> = TRouteDataMap<T> extends undefined
  ? {
      withUrl?: "server" | "client";
      searchParams?: TSearchParamsProvided;
    }
  : TRouteDataMap<T> extends Record<string, never>
  ? {
      withUrl?: "server" | "client";
      searchParams?: TSearchParamsProvided;
    }
  : TRouteDataMap<T> & {
      withUrl?: "server" | "client";
      searchParams?: TSearchParamsProvided;
    };

const isClientRoute = (route: any): route is TClientRoute =>
  Object.values(ROUTES.CLIENT).includes(route as TClientRoute);

const isAPIRoute = (route: any): route is TAPIRoute =>
  Object.values(ROUTES.API).includes(route as TAPIRoute);

const isExternalRoute = (route: any): route is TExternalRoute =>
  Object.values(ROUTES.EXTERNAL).includes(route as TExternalRoute);

const getSchema = <T extends TRoute>(route: T) => {
  if (isClientRoute(route)) return routeSchemas.CLIENT[route];
  if (isAPIRoute(route)) return routeSchemas.API[route];
  if (isExternalRoute(route)) return routeSchemas.EXTERNAL[route];

  throw new Error(`No schema found for route: ${route}`);
};

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withUrl, searchParams: _, ...rawParams } = params || {};
  let { searchParams } = params || {};

  const schema = getSchema(route);
  const routeParams = schema.parse(rawParams ?? {}) as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);

  const withUrlMapping = {
    server: getServerUrl() ?? "",
    client: getClientUrl() ?? "",
  };

  const url =
    withUrl && !route.startsWith("external-") ? withUrlMapping[withUrl] : "";

  if (isPurObject(searchParams)) {
    searchParams = typedEntries(searchParams).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  const parsedSearchParams = searchParams
    ? `?${new URLSearchParams(searchParams as TSearchParams)}`
    : "";

  return `${url}${computedUrl}${parsedSearchParams}`;
};
