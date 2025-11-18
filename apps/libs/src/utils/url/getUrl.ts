import type { TBetterAuthProviders } from "../../const/global.const.js";
import { languageCodes } from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import type { TCredentialSchema } from "../../schemas/database/credential.schema.js";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";
import { getClientUrl } from "./getClientUrl.js";
import { getServerUrl } from "./getServerUrl.js";

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

export type TClientRouteDataRequirements = {
  [CLIENT_ROUTES.CLIENT_HOME]: undefined;
  [CLIENT_ROUTES.CLIENT_SIGNIN]: undefined;
  [CLIENT_ROUTES.CLIENT_SIGNUP]: undefined;
  [CLIENT_ROUTES.CLIENT_FORGET_PASSWORD]: undefined;
  [CLIENT_ROUTES.CLIENT_RESET_PASSWORD]: undefined;
  [CLIENT_ROUTES.CLIENT_SETTINGS]: undefined;
  [CLIENT_ROUTES.CLIENT_MOVIE]: {
    tmdbId: TMovieSchema["tmdbId"] | ":tmdbId";
  };
  [CLIENT_ROUTES.CLIENT_OAUTH_CREDENTIALS]: undefined;
  [CLIENT_ROUTES.CLIENT_ERROR]: undefined;
  [CLIENT_ROUTES.CLIENT_NOTIFICATIONS]: undefined;
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

export type TApiRouteDataRequirements = {
  [API_ROUTES.API_SWAGGER]: {
    mode?: "doc" | "ui";
  };
  [API_ROUTES.API_HEALTH]: undefined;

  [API_ROUTES.API_AUTH]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_SIGNUP]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_SIGNIN_SOCIAL]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_REQUEST_PASSWORD_RESET]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_RESET_PASSWORD]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_SIGNOUT]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_EMAIL_VERIFICATION]: undefined;
  [API_ROUTES.API_AUTHENTIFICATION_LINK]: {
    providerId?: TBetterAuthProviders | "{providerId}";
  };
  [API_ROUTES.API_OAUTH_CREDENTIALS]: {
    credentialId?: TCredentialSchema["id"] | "{credentialId}";
  };

  [API_ROUTES.API_USERS]: { userId?: string };
  [API_ROUTES.API_USERS_ACCOUNTS]: undefined;
  [API_ROUTES.API_USERS_SESSION]: undefined;

  [API_ROUTES.API_IMAGES]: { imageId?: string | null };

  [API_ROUTES.API_MOVIES]: {
    tmdbId: "{tmdbId}" | number | undefined;
    resolution?: (typeof ytsQualities)[number] | "{resolution}";
    subtitlesLanguage?: keyof typeof languageCodes | "{subtitlesLanguage}";
  };
  [API_ROUTES.API_MOVIES_SUBSCRIPTION]: {
    tmdbId: TMovieSchema["tmdbId"] | "{tmdbId}";
  };

  [API_ROUTES.API_NOTIFICATIONS]: {
    notificationId?: string | "{notificationId}";
  };
  [API_ROUTES.API_NOTIFICATIONS_STATS]: undefined;
  [API_ROUTES.API_NOTIFICATIONS_TEST]: undefined;

  // sse routes
  [API_ROUTES.SSE_MOVIES]: {
    tmdbId: "{tmdbId}" | number;
  };
  [API_ROUTES.SSE_NOTIFICATIONS]: undefined;

  // Streaming routes
  [API_ROUTES.API_STREAMING_MOVIE_RESOLUTION]: {
    tmdbId: TMovieSchema["tmdbId"];
    resolution: (typeof ytsQualities)[number] | "{resolution}";
  };
  [API_ROUTES.API_STREAMING_MOVIE_SUBTITLES]: {
    tmdbId: TMovieSchema["tmdbId"];
    subtitlesLanguage: keyof typeof languageCodes | "{subtitlesLanguage}";
  };
};

export type TExternalRouteDataRequirements = {
  "external-imdb-movie": {
    imdbId: string;
  };
  "external-imdb-actor": {
    imdbId: string;
  };
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
      removeForwardSlash?: boolean;
    }
  : TRouteDataMap<T> & {
      withUrl?: "server" | "client";
      searchParams?: TSearchParams;
      removeForwardSlash?: boolean;
    };

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withUrl, searchParams, ...rawParams } = params || {};

  const routeParams = rawParams as TRouteDataMap<T>;
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
