import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { PagePagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FloatingBar } from "@/components/ui/FloatingBar";
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
import { Video, X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const pageSize = 10;

export const Playlist = ({ playlist }: { playlist: TPlaylistSchema }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { scrollTo } = useScrollArea();

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

  const movies = data ? data.movies : [];
  const totalCount = data ? data.totalCount : 0;

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
    <div className="flex flex-col gap-5">
      {movies.map((movie) => (
        <div key={movie.details.id} className="flex items-center gap-5">
          <MovieBaseInfo
            movie={movie.details}
            dir="col"
            posterSize="sm"
            info="partial"
          />
          <Button
            variant={"destructive"}
            onClick={() =>
              mutate({ playlistId: playlist.id, tmdbId: movie.details.id })
            }
          >
            <X />
          </Button>
        </div>
      ))}
      {!movies.length && (
        <div className="flex justify-center items-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Video />
              </EmptyMedia>
              <EmptyTitle>{t("playlist.emptyPlaylist")}</EmptyTitle>
              <EmptyDescription>
                {t("playlist.emptyPlaylistDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
      <FloatingBar className="bg-muted/50 p-1">
        <PagePagination
          page={page}
          setPage={(value) => {
            setPage(value);
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </FloatingBar>
    </div>
  );
};
