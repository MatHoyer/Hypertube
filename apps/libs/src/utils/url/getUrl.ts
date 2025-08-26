import { languageCodes } from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";
import { getServerUrl } from "./getServerUrl.js";

export type TClientRouteDataRequirements = {
  "client-home": undefined;
  "client-signin": undefined;
  "client-signup": undefined;
  "client-movie": {
    movieId: TMovieSchema["id"] | ":movieId";
  };
};

export type TApiRouteDataRequirements = {
  "api-health": undefined;
  "api-auth": undefined;

  // Scrappers routes
  "api-filters": {
    scrapper: "yts";
  };
  "api-movies": {
    scrapper: "yts";
  };
  "api-pagination": {
    scrapper: "yts";
  };
  "api-movie": {
    scrapper: "yts";
    movieId: TMovieSchema["id"];
  };
  "api-movie-download": {
    scrapper: "yts";
    movieId: TMovieSchema["id"];
    resolution: (typeof ytsQualities)[number];
    subtitlesLanguage: keyof typeof languageCodes | "none";
  };
};

type TRouteDataRequirements = TClientRouteDataRequirements &
  TApiRouteDataRequirements;

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
  "client-movie": ({ movieId }) => `/movie/${movieId}`,

  // API routes
  "api-health": () => "/api/health",
  "api-auth": () => "/api/auth",

  // API scrappers routes
  "api-filters": ({ scrapper }) => `/api/scrappers/${scrapper}/filters`,
  "api-movies": ({ scrapper }) => `/api/scrappers/${scrapper}/movies`,
  "api-pagination": ({ scrapper }) => `/api/scrappers/${scrapper}/pagination`,
  "api-movie": ({ scrapper, movieId }) =>
    `/api/scrappers/${scrapper}/movie/${movieId}`,
  "api-movie-download": ({
    scrapper,
    movieId,
    resolution,
    subtitlesLanguage,
  }) =>
    `/api/scrappers/${scrapper}/movie/${movieId}/resolution/${resolution}/subtitles/${subtitlesLanguage}/download`,
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
  const {
    withServerUrl = false,
    searchParams,
    removeForwardSlash = true,
    ...rawParams
  } = params || {};

  const routeParams = rawParams as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);
  const serverUrl = withServerUrl ? getServerUrl() : "";

  const parsedSearchParams = searchParams
    ? `?${new URLSearchParams(searchParams)}`
    : "";

  return `${serverUrl}${
    removeForwardSlash ? computedUrl.slice(1) : computedUrl
  }${parsedSearchParams}`;
};
