import type { TBetterAuthProviders } from "../../const/global.const.js";
import { languageCodes } from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";
import { getClientUrl } from "./getClientUrl.js";
import { getServerUrl } from "./getServerUrl.js";

export type TClientRouteDataRequirements = {
  "client-home": undefined;
  "client-signin": undefined;
  "client-signup": undefined;
  "client-forget-password": undefined;
  "client-reset-password": undefined;
  "client-settings": undefined;
  "client-movie": {
    tmdbId: TMovieSchema["tmdbId"] | ":tmdbId";
  };
  "client-error": undefined;
  "client-notifications": undefined;
};

export type TApiRouteDataRequirements = {
  "api-swagger": {
    mode?: "doc" | "ui";
  };
  "api-health": undefined;

  "api-auth": undefined;
  "api-authentification": undefined;
  "api-authentification-signup": undefined;
  "api-authentification-signin": undefined;
  "api-authentification-signin-social": undefined;
  "api-authentification-request-password-reset": undefined;
  "api-authentification-reset-password": undefined;
  "api-authentification-signout": undefined;
  "api-authentification-email-verification": undefined;
  "api-authentification-link": {
    providerId?: TBetterAuthProviders | "{providerId}";
  };

  "api-users": { userId?: string };
  "api-users-accounts": undefined;
  "api-users-session": undefined;

  "api-images": { imageId?: string | null };

  "api-movies": {
    tmdbId: "{tmdbId}" | number | undefined;
    resolution?: (typeof ytsQualities)[number] | "{resolution}";
    subtitlesLanguage?: keyof typeof languageCodes | "{subtitlesLanguage}";
  };

  "api-notifications": {
    notificationId?: string | "{notificationId}";
  };
  "api-notifications-stats": undefined;

  // sse routes
  "sse-movies": {
    tmdbId: "{tmdbId}" | number;
  };

  // Streaming routes
  "api-streaming-movie-resolution": {
    tmdbId: TMovieSchema["tmdbId"];
    resolution: (typeof ytsQualities)[number] | "{resolution}";
  };
  "api-streaming-movie-subtitles": {
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
  "client-home": () => "/",
  "client-signin": () => "/sign-in",
  "client-signup": () => "/sign-up",
  "client-forget-password": () => "/forget-password",
  "client-reset-password": () => "/reset-password",
  "client-settings": () => "/settings",
  "client-movie": ({ tmdbId }) => `/movie/${tmdbId}`,
  "client-error": () => "/error",
  "client-notifications": () => "/notifications",

  // API routes
  "api-swagger": ({ mode }) => (mode ? `/api/swagger/${mode}` : "/api/swagger"),
  "api-health": () => "/api/health",

  "api-auth": () => "/api/auth",
  "api-authentification": () => "/api/authentification",
  "api-authentification-signup": () => "/api/authentification/sign-up",
  "api-authentification-signin": () => "/api/authentification/sign-in",
  "api-authentification-signin-social": () =>
    "/api/authentification/sign-in-social",
  "api-authentification-request-password-reset": () =>
    "/api/authentification/request-password-reset",
  "api-authentification-reset-password": () =>
    "/api/authentification/reset-password",
  "api-authentification-signout": () => "/api/authentification/sign-out",
  "api-authentification-email-verification": () =>
    `/api/authentification/email-verification`,
  "api-authentification-link": ({ providerId }) =>
    providerId
      ? `/api/authentification/link/${providerId}`
      : "/api/authentification/link",

  "api-users": ({ userId }) => "/api/users" + (userId ? `/${userId}` : ""),
  "api-users-accounts": () => "/api/users/accounts",
  "api-users-session": () => "/api/users/session",

  "api-images": ({ imageId }) => "/api/images" + (imageId ? `/${imageId}` : ""),

  "api-movies": ({ tmdbId, resolution, subtitlesLanguage }) => {
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

  "api-notifications": ({ notificationId }) =>
    `/api/notifications` + (notificationId ? `/${notificationId}` : ""),
  "api-notifications-stats": () => "/api/notifications/stats",

  "sse-movies": ({ tmdbId }) => `/api/movies/${tmdbId}/sse`,

  "api-streaming-movie-resolution": ({ tmdbId, resolution }) =>
    `/api/streaming/movie/${tmdbId}/resolution/${resolution}`,
  "api-streaming-movie-subtitles": ({ tmdbId, subtitlesLanguage }) =>
    `/api/streaming/movie/${tmdbId}/subtitles/${subtitlesLanguage}`,

  // Internal routes

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
