import { getServerUrl } from "./getServerUrl";

type TClientRouteDataRequirements = {
  "client-home": undefined;
  "client-example-for-params": {
    someInfos: string;
  };
};

type TApiRouteDataRequirements = {
  "api-health": undefined;
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
  "client-example-for-params": ({ someInfos }) => `/example/${someInfos}`,

  // API routes
  "api-health": () => "/api/health",
};

type TUrlParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

type TGetUrlArgs<T extends TRoute> = TRouteDataMap<T> extends undefined
  ? { withServerUrl?: boolean; urlParams?: TUrlParams }
  : TRouteDataMap<T> & {
      withServerUrl?: boolean;
      urlParams?: TUrlParams;
    };

export const getUrl = <T extends TRoute>(
  route: T,
  params?: TGetUrlArgs<T>
): string => {
  const { withServerUrl = false, urlParams, ...rawParams } = params || {};

  const routeParams = rawParams as TRouteDataMap<T>;
  const routeFn = routes[route];

  const computedUrl = routeFn(routeParams);
  const serverUrl = withServerUrl ? getServerUrl() : "";

  const parsedUrlParams = urlParams
    ? `?${new URLSearchParams(urlParams).toString()}`
    : "";

  return `${serverUrl}${
    serverUrl ? computedUrl.slice(1) : computedUrl
  }${parsedUrlParams}`;
};
