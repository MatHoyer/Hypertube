import { languageCodes } from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";
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
};

export type TApiRouteDataRequirements = {
  "api-swagger": {
    mode?: "doc" | "ui";
  };
  "api-health": undefined;

  "api-auth": undefined;
  "api-users": { userId?: string };

  "api-images": { imageId?: string | null };

  "api-movies": {
    tmdbId: "{tmdbId}" | number | undefined;
    resolution?: (typeof ytsQualities)[number] | "{resolution}";
    subtitlesLanguage?: keyof typeof languageCodes | "{subtitlesLanguage}";
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

export type TInternalRouteDataRequirements = {
  "internal-movie-download-job-started": undefined;
  "internal-movie-download-job-end": undefined;
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
  TInternalRouteDataRequirements &
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

  // API routes
  "api-swagger": ({ mode }) => (mode ? `/api/swagger/${mode}` : "/api/swagger"),
  "api-health": () => "/api/health",
  "api-auth": () => "/api/auth",
  "api-images": ({ imageId }) => "/api/images" + (imageId ? `/${imageId}` : ""),
  "api-users": ({ userId }) => "/api/users" + (userId ? `/${userId}` : ""),

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

  "api-streaming-movie-resolution": ({ tmdbId, resolution }) =>
    `/api/streaming/movie/${tmdbId}/resolution/${resolution}`,
  "api-streaming-movie-subtitles": ({ tmdbId, subtitlesLanguage }) =>
    `/api/streaming/movie/${tmdbId}/subtitles/${subtitlesLanguage}`,

  // Internal routes
  "internal-movie-download-job-started": () =>
    "/api/internal/movie-download-job-started",
  "internal-movie-download-job-end": () =>
    "/api/internal/movie-download-job-end",

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
      withServerUrl?: boolean;
      searchParams?: TSearchParams;
      removeForwardSlash?: boolean;
    }
  : TRouteDataMap<T> & {
      withServerUrl?: boolean;
      searchParams?: TSearchParams;
      removeForwardSlash?: boolean;
    };

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withServerUrl = false, searchParams, ...rawParams } = params || {};

  const routeParams = rawParams as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);

  const serverUrl =
    withServerUrl && !route.startsWith("external-") ? getServerUrl() : "";

  const parsedSearchParams = searchParams
    ? `?${new URLSearchParams(searchParams)}`
    : "";

  return `${serverUrl}${computedUrl}${parsedSearchParams}`;
};
