import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieListWithPagination } from "@/components/movies/MovieListWithPagination";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieFromPlaylistSchemas,
  getPlaylistSchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import type { TPlaylistSchema } from "@hypertube/libs/src/schemas/database/playlist.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const pageSize = 10;

export const Playlist = ({ playlist }: { playlist: TPlaylistSchema }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, _] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isPending, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          playlistId: playlist.id,
          searchParams: {
            page: page.toString(),
            pageSize: pageSize.toString(),
          },
        }),
        schemas: getPlaylistSchemas,
      }),
  });

  const { mutate } = useMutation({
    mutationFn: ({
      playlistId,
      tmdbId,
    }: {
      playlistId: TPlaylistSchema["id"];
      tmdbId: TTmdbMovieSchema["id"];
    }) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.PLAYLISTS_MOVIE, { playlistId, tmdbId }),
        schemas: deleteMovieFromPlaylistSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      });
      toast.success(t("playlist.deleteMovieSuccess"));
    },
    onError: () => {
      toast.error(t("playlist.deleteMovieFailed"));
    },
  });

  if (isPending) return <LoadingResource resource="playlist" />;
  if (isError) return <ErrorResource resource="playlist" />;

  return (
    <MovieListWithPagination
      movieListType="playlist"
      movies={data ? data.movies : []}
      pageSize={pageSize}
      totalCount={data ? data.totalCount : 0}
      deleteFn={(tmdbId: number) => mutate({ playlistId: playlist.id, tmdbId })}
    />
  );
};
