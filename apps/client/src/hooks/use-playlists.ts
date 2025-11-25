import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get the user's playlists.
 * WARNING: Should ONLY be used on private routes when the user is logged in.
 * This hook uses cache to infer the type and will throw an error if the user is not authenticated.
 */
export const useUserPlaylists = () => {
  const query = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS),
        schemas: getPlaylistsSchemas,
      }),
    retry: false,
  });

  return query.data?.playlists ?? [];
};
