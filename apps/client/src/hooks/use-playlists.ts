import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";

const playlistsPageSize = 3;

const fetchPlaylists = async (pageParam: number) => {
  const res = await axiosFetch({
    method: "GET",
    url: getUrl(ROUTES.API.PLAYLISTS, {
      searchParams: {
        page: pageParam.toString(),
        pageSize: playlistsPageSize.toString(),
      },
    }),
    schemas: getPlaylistsSchemas,
  });
  return res;
};

export const useUserPlaylists = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useInfiniteQuery({
      queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      queryFn: ({ pageParam }) => fetchPlaylists(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.totalPages > lastPage.page ? lastPage.page + 1 : undefined,
      refetchOnMount: false,
    });

  const playlists = data?.pages.flatMap((d) => d.playlists) ?? [];

  const playlistsWithMoviesSet = playlists.map((playlist) => {
    const movies = playlist.movies.map((movie) => movie.tmdbId);
    return { ...playlist, movies: new Set(movies) };
  });

  return {
    data: { ...data?.pages[0], playlists: playlistsWithMoviesSet },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  };
};
