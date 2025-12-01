import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getHistorySchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get the user's historic.
 * WARNING: Should ONLY be used on private routes when the user is logged in.
 * This hook uses cache to infer the type and will throw an error if the user is not authenticated.
 */
export const useUserHistoric = () => {
  const query = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY),
        schemas: getHistorySchemas,
      }),
    retry: false,
    refetchOnMount: false,
  });

  return query.data?.movies ?? [];
};
