import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

export const useUserPlaylists = ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  const query = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          searchParams: {
            page: page.toString(),
            pageSize: pageSize.toString(),
          },
        }),
        schemas: getPlaylistsSchemas,
      }),
    placeholderData: (previousData) => previousData,
    retry: false,
    refetchOnMount: false,
  });

  return {
    playlists: query.data?.playlists ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
