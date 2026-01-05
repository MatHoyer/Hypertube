import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieList } from "@/components/movies/MovieList";
import { PagePagination } from "@/components/Pagination";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { useConvertParams } from "@/hooks/use-convert-params";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
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
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

const playlistPageSize = 10;

export const PlaylistPage = () => {
  const { scrollTo } = useScrollArea();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, isPlaceholderData, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, {
      playlistId,
      page,
    }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          playlistId,
          searchParams: {
            page: page.toString(),
            pageSize: playlistPageSize.toString(),
          },
        }),
        schemas: getPlaylistSchemas,
      }),
    placeholderData: (previousData) => previousData,
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

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource
          resource="playlist"
          count={data?.total ?? 0}
          dynamicTitle={data?.name ?? t("global.loadingRessource")}
        />
      </LayoutHeader>
      <LayoutContent>
        {data && !isPlaceholderData && (
          <MovieList
            movieListType="playlist"
            movies={data.movies}
            deleteFn={(tmdbId) => mutate({ playlistId, tmdbId })}
          />
        )}
        {(isLoading || isPlaceholderData) && (
          <LoadingResource resource="playlist" />
        )}
        {isError && <ErrorResource resource="playlist" />}
        {(data?.total ?? 0) > playlistPageSize && (
          <FloatingBar>
            <PagePagination
              page={page}
              setPage={(value) => {
                setPage(value);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              maxPage={data?.totalPages ?? 0}
            />
          </FloatingBar>
        )}
      </LayoutContent>
    </Layout>
  );
};
