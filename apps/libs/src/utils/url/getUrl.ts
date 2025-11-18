import z from "zod";
import {
  betterAuthProviders,
  languageCodes,
} from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import { credentialSchema } from "../../schemas/database/credential.schema.js";
import { imageSchema } from "../../schemas/database/image.schema.js";
import { movieSchema } from "../../schemas/database/movie.schema.js";
import { notificationSchema } from "../../schemas/database/notifications.schema.js";
import { userSchema } from "../../schemas/database/user.schema.js";
import { getClientUrl } from "./getClientUrl.js";
import { getServerUrl } from "./getServerUrl.js";

// Use z.object({}) to make undefined

export const CLIENT_ROUTES = {
  CLIENT_HOME: "client-home",
  CLIENT_SIGNIN: "client-signin",
  CLIENT_SIGNUP: "client-signup",
  CLIENT_FORGET_PASSWORD: "client-forget-password",
  CLIENT_RESET_PASSWORD: "client-reset-password",
  CLIENT_SETTINGS: "client-settings",
  CLIENT_MOVIE: "client-movie",
  CLIENT_OAUTH_CREDENTIALS: "client-oauth-credentials",
  CLIENT_ERROR: "client-error",
  CLIENT_NOTIFICATIONS: "client-notifications",
} as const;

export type TClientRoute = (typeof CLIENT_ROUTES)[keyof typeof CLIENT_ROUTES];

const clientRouteSchemas = {
  [CLIENT_ROUTES.CLIENT_HOME]: z.object({}),
  [CLIENT_ROUTES.CLIENT_SIGNIN]: z.object({}),
  [CLIENT_ROUTES.CLIENT_SIGNUP]: z.object({}),
  [CLIENT_ROUTES.CLIENT_FORGET_PASSWORD]: z.object({}),
  [CLIENT_ROUTES.CLIENT_RESET_PASSWORD]: z.object({}),
  [CLIENT_ROUTES.CLIENT_SETTINGS]: z.object({}),
  [CLIENT_ROUTES.CLIENT_MOVIE]: z.object({
    tmdbId: z.union([movieSchema.shape.tmdbId, z.literal(":tmdbId")]),
  }),
  [CLIENT_ROUTES.CLIENT_OAUTH_CREDENTIALS]: z.object({}),
  [CLIENT_ROUTES.CLIENT_ERROR]: z.object({}),
  [CLIENT_ROUTES.CLIENT_NOTIFICATIONS]: z.object({}),
};

type TClientRouteDataRequirements = {
  [T in keyof typeof clientRouteSchemas]: z.infer<
    (typeof clientRouteSchemas)[T]
  >;
};

export const API_ROUTES = {
  API_SWAGGER: "api-swagger",
  API_HEALTH: "api-health",
  API_AUTH: "api-auth",
  API_AUTHENTIFICATION: "api-authentification",
  API_AUTHENTIFICATION_SIGNUP: "api-authentification-signup",
  API_AUTHENTIFICATION_SIGNIN: "api-authentification-signin",
  API_AUTHENTIFICATION_SIGNIN_SOCIAL: "api-authentification-signin-social",
  API_AUTHENTIFICATION_REQUEST_PASSWORD_RESET:
    "api-authentification-request-password-reset",
  API_AUTHENTIFICATION_RESET_PASSWORD: "api-authentification-reset-password",
  API_AUTHENTIFICATION_SIGNOUT: "api-authentification-signout",
  API_AUTHENTIFICATION_EMAIL_VERIFICATION:
    "api-authentification-email-verification",
  API_AUTHENTIFICATION_LINK: "api-authentification-link",
  API_OAUTH_CREDENTIALS: "api-oauth-credentials",
  API_USERS: "api-users",
  API_USERS_ACCOUNTS: "api-users-accounts",
  API_USERS_SESSION: "api-users-session",
  API_IMAGES: "api-images",
  API_MOVIES: "api-movies",
  API_MOVIES_SUBSCRIPTION: "api-movies-subscription",
  API_NOTIFICATIONS: "api-notifications",
  API_NOTIFICATIONS_STATS: "api-notifications-stats",
  API_NOTIFICATIONS_TEST: "api-notifications-test",
  API_STREAMING_MOVIE_RESOLUTION: "api-streaming-movie-resolution",
  API_STREAMING_MOVIE_SUBTITLES: "api-streaming-movie-subtitles",
  SSE_MOVIES: "sse-movies",
  SSE_NOTIFICATIONS: "sse-notifications",
} as const;

export type TApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];

const apiRouteSchemas = {
  [API_ROUTES.API_SWAGGER]: z.object({
    mode: z.union([z.literal("doc"), z.literal("ui")]).optional(),
  }),
  [API_ROUTES.API_HEALTH]: z.object({}),
  [API_ROUTES.API_AUTH]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_SIGNUP]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN_SOCIAL]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_REQUEST_PASSWORD_RESET]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_RESET_PASSWORD]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_SIGNOUT]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_EMAIL_VERIFICATION]: z.object({}),
  [API_ROUTES.API_AUTHENTIFICATION_LINK]: z.object({
    providerId: z
      .union([z.enum(betterAuthProviders), z.literal("{providerId}")])
      .optional(),
  }),
  [API_ROUTES.API_OAUTH_CREDENTIALS]: z.object({
    credentialId: z
      .union([credentialSchema.shape.id, z.literal("{credentialId}")])
      .optional(),
  }),
  [API_ROUTES.API_USERS]: z.object({
    userId: z.union([userSchema.shape.id, z.literal("{userId}")]).optional(),
  }),
  [API_ROUTES.API_USERS_ACCOUNTS]: z.object({}),
  [API_ROUTES.API_USERS_SESSION]: z.object({}),
  [API_ROUTES.API_IMAGES]: z.object({
    imageId: z.union([imageSchema.shape.id, z.literal("{imageId}")]).optional(),
  }),
  [API_ROUTES.API_MOVIES]: z.object({
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
  [API_ROUTES.API_MOVIES_SUBSCRIPTION]: z.object({
    tmdbId: z
      .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
      .optional(),
  }),
  [API_ROUTES.API_NOTIFICATIONS]: z.object({
    notificationId: z
      .union([notificationSchema.shape.id, z.literal("{notificationId}")])
      .optional(),
  }),
  [API_ROUTES.API_NOTIFICATIONS_STATS]: z.object({}),
  [API_ROUTES.API_NOTIFICATIONS_TEST]: z.object({}),
  [API_ROUTES.SSE_MOVIES]: z.object({
    tmdbId: z
      .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
      .optional(),
  }),
  [API_ROUTES.SSE_NOTIFICATIONS]: z.object({}),
  [API_ROUTES.API_STREAMING_MOVIE_RESOLUTION]: z.object({
    tmdbId: z
      .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
      .optional(),
    resolution: z
      .union([z.enum(ytsQualities), z.literal("{resolution}")])
      .optional(),
  }),
  [API_ROUTES.API_STREAMING_MOVIE_SUBTITLES]: z.object({
    tmdbId: z
      .union([movieSchema.shape.tmdbId, z.literal("{tmdbId}")])
      .optional(),
    subtitlesLanguage: z
      .union([z.enum(languageCodes), z.literal("{subtitlesLanguage}")])
      .optional(),
  }),
};

type TApiRouteDataRequirements = {
  [T in keyof typeof apiRouteSchemas]: z.infer<(typeof apiRouteSchemas)[T]>;
};

export const EXTERNAL_ROUTES = {
  EXTERNAL_IMDB_MOVIE: "external-imdb-movie",
  EXTERNAL_IMDB_ACTOR: "external-imdb-actor",
} as const;

export type TExternalRoute =
  (typeof EXTERNAL_ROUTES)[keyof typeof EXTERNAL_ROUTES];

const externalRouteSchemas = {
  [EXTERNAL_ROUTES.EXTERNAL_IMDB_MOVIE]: z.object({
    imdbId: z.string(),
  }),
  [EXTERNAL_ROUTES.EXTERNAL_IMDB_ACTOR]: z.object({
    imdbId: z.string(),
  }),
};

export type TExternalRouteDataRequirements = {
  [T in keyof typeof externalRouteSchemas]: z.infer<
    (typeof externalRouteSchemas)[T]
  >;
};

const routeSchemas = {
  ...clientRouteSchemas,
  ...apiRouteSchemas,
  ...externalRouteSchemas,
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
  [CLIENT_ROUTES.CLIENT_HOME]: () => "/",
  [CLIENT_ROUTES.CLIENT_SIGNIN]: () => "/sign-in",
  [CLIENT_ROUTES.CLIENT_SIGNUP]: () => "/sign-up",
  [CLIENT_ROUTES.CLIENT_FORGET_PASSWORD]: () => "/forget-password",
  [CLIENT_ROUTES.CLIENT_RESET_PASSWORD]: () => "/reset-password",
  [CLIENT_ROUTES.CLIENT_SETTINGS]: () => "/settings",
  [CLIENT_ROUTES.CLIENT_MOVIE]: ({ tmdbId }) => `/movie/${tmdbId}`,
  [CLIENT_ROUTES.CLIENT_OAUTH_CREDENTIALS]: () => "/credentials",
  [CLIENT_ROUTES.CLIENT_ERROR]: () => "/error",
  [CLIENT_ROUTES.CLIENT_NOTIFICATIONS]: () => "/notifications",

  // API routes
  [API_ROUTES.API_SWAGGER]: ({ mode }) =>
    mode ? `/api/swagger/${mode}` : "/api/swagger",
  [API_ROUTES.API_HEALTH]: () => "/api/health",

  [API_ROUTES.API_AUTH]: () => "/api/auth",
  [API_ROUTES.API_AUTHENTIFICATION]: () => "/api/authentification",
  [API_ROUTES.API_AUTHENTIFICATION_SIGNUP]: () =>
    "/api/authentification/sign-up",
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN]: () =>
    "/api/authentification/sign-in",
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN_SOCIAL]: () =>
    "/api/authentification/sign-in-social",
  [API_ROUTES.API_AUTHENTIFICATION_REQUEST_PASSWORD_RESET]: () =>
    "/api/authentification/request-password-reset",
  [API_ROUTES.API_AUTHENTIFICATION_RESET_PASSWORD]: () =>
    "/api/authentification/reset-password",
  [API_ROUTES.API_AUTHENTIFICATION_SIGNOUT]: () =>
    "/api/authentification/sign-out",
  [API_ROUTES.API_AUTHENTIFICATION_EMAIL_VERIFICATION]: () =>
    `/api/authentification/email-verification`,
  [API_ROUTES.API_AUTHENTIFICATION_LINK]: ({ providerId }) =>
    providerId
      ? `/api/authentification/link/${providerId}`
      : "/api/authentification/link",
  [API_ROUTES.API_OAUTH_CREDENTIALS]: ({ credentialId }) =>
    credentialId
      ? `/api/oauth/credentials/${credentialId}`
      : "/api/oauth/credentials",

  [API_ROUTES.API_USERS]: ({ userId }) =>
    "/api/users" + (userId ? `/${userId}` : ""),
  [API_ROUTES.API_USERS_ACCOUNTS]: () => "/api/users/accounts",
  [API_ROUTES.API_USERS_SESSION]: () => "/api/users/session",

  [API_ROUTES.API_IMAGES]: ({ imageId }) =>
    "/api/images" + (imageId ? `/${imageId}` : ""),

  [API_ROUTES.API_MOVIES]: ({ tmdbId, resolution, subtitlesLanguage }) => {
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
  [API_ROUTES.API_MOVIES_SUBSCRIPTION]: ({ tmdbId }) =>
    `/api/movies/${tmdbId}/subscription`,

  [API_ROUTES.API_NOTIFICATIONS]: ({ notificationId }) =>
    `/api/notifications` + (notificationId ? `/${notificationId}` : ""),
  [API_ROUTES.API_NOTIFICATIONS_STATS]: () => "/api/notifications/stats",
  [API_ROUTES.API_NOTIFICATIONS_TEST]: () => "/api/notifications/test",

  // SSE routes
  [API_ROUTES.SSE_MOVIES]: ({ tmdbId }) => `/api/movies/${tmdbId}/sse`,
  [API_ROUTES.SSE_NOTIFICATIONS]: () => "/api/notifications/sse",

  // Streaming routes
  [API_ROUTES.API_STREAMING_MOVIE_RESOLUTION]: ({ tmdbId, resolution }) =>
    `/api/streaming/movie/${tmdbId}/resolution/${resolution}`,
  [API_ROUTES.API_STREAMING_MOVIE_SUBTITLES]: ({ tmdbId, subtitlesLanguage }) =>
    `/api/streaming/movie/${tmdbId}/subtitles/${subtitlesLanguage}`,

  // External routes
  "external-imdb-movie": ({ imdbId }) => `https://www.imdb.com/title/${imdbId}`,
  "external-imdb-actor": ({ imdbId }) =>
    `https://www.imdb.com/name/nm${imdbId}`,
};

type TSearchParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

type TGetUrlArgs<T extends TRoute> = TRouteDataMap<T> extends undefined
  ? {
      withUrl?: "server" | "client";
      searchParams?: TSearchParams;
    }
  : TRouteDataMap<T> & {
      withUrl?: "server" | "client";
      searchParams?: TSearchParams;
    };

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withUrl, searchParams, ...rawParams } = params || {};

  const schema = routeSchemas[route];
  const routeParams = schema.parse(rawParams) as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);

  const withUrlMapping = {
    server: getServerUrl() ?? "",
    client: getClientUrl() ?? "",
  };

  const url =
    withUrl && !route.startsWith("external-") ? withUrlMapping[withUrl] : "";

  const parsedSearchParams = searchParams
    ? `?${new URLSearchParams(searchParams)}`
    : "";

  return `${url}${computedUrl}${parsedSearchParams}`;
};
