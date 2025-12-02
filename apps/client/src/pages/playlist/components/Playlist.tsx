import { LoadingPage } from "@/components/LoadingPage";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  deleteMovieFromPlaylistSchemas,
  getPlaylistSchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import type { TPlaylistSchema } from "@hypertube/libs/src/schemas/database/playlist.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const Playlist = ({
  playlistName,
  setIsNotFound,
}: {
  playlistName: TPlaylistSchema["name"];
  setIsNotFound: (value: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [_, setSearchParams] = useSearchParams();

  useEffect(
    () => setSearchParams({ page: page.toString() }, { replace: true }),
    [setSearchParams, page]
  );

  const { data, isPending, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          playlistName,
          searchParams: { page: page.toString(), pageSize: "10" },
        }),
        schemas: getPlaylistSchemas,
      }),
  });

  const movies = data ? data.movies : [];
  const playlistId = data ? data.playlistId : "";
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

  if (isPending) return <LoadingPage resource="global" />;
  if (isError) {
    return (
      <div className="flex justify-center items-center">
        <Typography textSize="lg">{t("global.error")}</Typography>
      </div>
    );
  }

  if (page !== 1 && !movies.length) setIsNotFound(true);

  return (
    <div className="flex flex-col gap-5">
      {movies.map(({ ...movie }) => (
        <div key={movie.id} className="flex items-center gap-5">
          <MovieBaseInfo
            movie={movie}
            dir="col"
            posterSize="sm"
            info="partial"
          />
          <Button
            variant={"destructive"}
            onClick={() => mutate({ playlistId, tmdbId: movie.id })}
          >
            <X />
          </Button>
        </div>
      ))}
      {!movies.length && (
        <div className="flex justify-center items-center">
          <Typography textSize="lg">{t("historic.empty")}</Typography>
        </div>
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={cn(page <= 1 && "opacity-50 pointer-events-none")}
              onClick={() => setPage((prev) => prev - 1)}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className={cn(
                totalCount <= page * 10 && "opacity-50 pointer-events-none"
              )}
              onClick={() => setPage((prev) => prev + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
