import { getServerUrl } from "./getServerUrl.js";

export type TClientRouteDataRequirements = {
  "client-home": undefined;
};

export type TApiRouteDataRequirements = {
  "api-health": undefined;
  "api-test": {
    endpoint?: "test" | "movie" | "prisma";
    id?: number;
  };
  "api-scrappers": {
    scrapper: "yts";
    endpoint?: "filters" | "movies" | "pagination";
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
  "client-home": () => "",

  // API routes
  "api-health": () => "/api/health",
  "api-test": ({ endpoint, id }) => {
    const baseUrl = endpoint ? `/api/test/${endpoint}` : "/api/test";
    return id ? `${baseUrl}/${id}` : baseUrl;
  },
  "api-scrappers": ({ scrapper, endpoint }) => {
    const baseUrl = `/api/scrappers/${scrapper}`;
    return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  },
};

type TSearchParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

type TGetUrlArgs<T extends TRoute> = TRouteDataMap<T> extends undefined
  ? { withServerUrl?: boolean; searchParams?: TSearchParams }
  : TRouteDataMap<T> & {
      withServerUrl?: boolean;
      searchParams?: TSearchParams;
    };

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withServerUrl = false, searchParams, ...rawParams } = params || {};

  const routeParams = rawParams as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);
  const serverUrl = withServerUrl ? getServerUrl() : "";

  const parsedSearchParams = searchParams
    ? `?${new URLSearchParams(searchParams).toString()}`
    : "";

  return `${serverUrl}${
    serverUrl ? computedUrl.slice(1) : computedUrl
  }${parsedSearchParams}`;
};
