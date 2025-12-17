import { MovieListWithPagination } from "@/components/movies/MovieListWithPagination";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieFromPlaylistSchemas,
  getUrl,
  ROUTES,
  type TGetPlaylistSchemas,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import type { TPlaylistSchema } from "@hypertube/libs/src/schemas/database/playlist.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Playlist: React.FC<{
  playlistPage: TGetPlaylistSchemas["response"];
  playlistPageSize: number;
  playlistId: TPlaylistSchema["id"];
}> = ({ playlistPage, playlistPageSize, playlistId }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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

  return (
    <MovieListWithPagination
      movieListType="playlist"
      movies={playlistPage.movies}
      pageSize={playlistPageSize}
      totalCount={playlistPage.totalCount}
      deleteFn={(tmdbId: number) => mutate({ playlistId, tmdbId })}
    />
  );
};
