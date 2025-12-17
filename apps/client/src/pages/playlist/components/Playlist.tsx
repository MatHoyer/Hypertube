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
  movies: TGetPlaylistSchemas["response"]["movies"];
  playlistMaxPage: number;
  playlistId: TPlaylistSchema["id"];
}> = ({ movies, playlistMaxPage, playlistId }) => {
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
      movies={movies}
      maxPage={playlistMaxPage}
      deleteFn={(tmdbId: number) => mutate({ playlistId, tmdbId })}
    />
  );
};
