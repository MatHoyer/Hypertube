import { languageCodes } from "../../const/global.const.js";
import { ytsQualities } from "../../const/yts.const.js";
import type { TMovieSchema } from "../../schemas/database/movie.schema.js";
import { getServerUrl } from "./getServerUrl.js";

export type TClientRouteDataRequirements = {
  "client-home": undefined;
};

export type TApiRouteDataRequirements = {
  "api-health": undefined;
  "api-auth": undefined;
  "api-scrappers": {
    scrapper: "yts";
    endpoint?: "filters" | "movies" | "pagination" | "download";
    urlParams?: {
      movieId: TMovieSchema["id"];
      resolution: (typeof ytsQualities)[number];
      subtitlesLanguage: keyof typeof languageCodes | "none";
    };
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

  // API routes
  "api-health": () => "/api/health",
  "api-auth": () => "/api/auth",
  "api-scrappers": ({ scrapper, endpoint, urlParams }) => {
    const baseUrl = `/api/scrappers/${scrapper}`;

    if (endpoint === "download") {
      if (!urlParams) {
        throw new Error("Url params are required for download endpoint");
      }
      return `/${baseUrl}/movie/${urlParams.movieId}/resolution/${urlParams.resolution}/subtitles/${urlParams.subtitlesLanguage}/${endpoint}`;
    }

    return endpoint ? `/${baseUrl}/${endpoint}` : baseUrl;
  },
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
