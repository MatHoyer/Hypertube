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
    movieId: TMovieSchema["id"] | ":movieId";
  };
};

export type TApiRouteDataRequirements = {
  "api-swagger": {
    mode?: "doc" | "ui";
  };

  "api-health": undefined;
  "api-auth": undefined;

  // Users routes
  "api-users-upload-picture": undefined;
  "api-users-get-picture": {
    pictureName: string;
  };

  // Scrappers routes
  "api-filters": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
  };
  "api-movies": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
  };
  "api-pagination": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
  };
  "api-movie": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
    movieId: TMovieSchema["id"];
  };

  // Downloads routes
  "api-movie-download-resolution": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
    movieId: TMovieSchema["id"];
    resolution: (typeof ytsQualities)[number] | "{resolution}";
  };
  "api-movie-download-subtitles": {
    scrapper: "yts" | "{scrapper}" | ":scrapper";
    movieId: TMovieSchema["id"];
    subtitlesLanguage: keyof typeof languageCodes | "{subtitlesLanguage}";
  };

  // Streaming routes
  "api-streaming-movie-resolution": {
    movieId: TMovieSchema["id"];
    resolution: (typeof ytsQualities)[number] | "{resolution}";
  };
  "api-streaming-movie-subtitles": {
    movieId: TMovieSchema["id"];
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
  "client-movie": ({ movieId }) => `/movie/${movieId}`,

  // API routes
  "api-swagger": ({ mode }) => (mode ? `/api/swagger/${mode}` : "/api/swagger"),
  "api-health": () => "/api/health",
  "api-auth": () => "/api/auth",

  // API users
  "api-users-upload-picture": () => "/api/users/upload-picture",
  "api-users-get-picture": ({ pictureName }) =>
    `/api/users/get-picture/${pictureName}`,

  // API scrappers routes
  "api-filters": ({ scrapper }) => `/api/scrappers/${scrapper}/filters`,
  "api-movies": ({ scrapper }) => `/api/scrappers/${scrapper}/movies`,
  "api-pagination": ({ scrapper }) => `/api/scrappers/${scrapper}/pagination`,
  "api-movie": ({ scrapper, movieId }) =>
    `/api/scrappers/${scrapper}/movie/${movieId}`,

  // API downloads routes
  "api-movie-download-resolution": ({ scrapper, movieId, resolution }) =>
    `/api/scrappers/${scrapper}/movie/${movieId}/resolution/${resolution}`,
  "api-movie-download-subtitles": ({ scrapper, movieId, subtitlesLanguage }) =>
    `/api/scrappers/${scrapper}/movie/${movieId}/subtitles/${subtitlesLanguage}`,

  // API streaming routes
  "api-streaming-movie-resolution": ({ movieId, resolution }) =>
    `/api/streaming/movie/${movieId}/resolution/${resolution}`,
  "api-streaming-movie-subtitles": ({ movieId, subtitlesLanguage }) =>
    `/api/streaming/movie/${movieId}/subtitles/${subtitlesLanguage}`,

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
