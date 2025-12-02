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
  deleteMovieFromHistorySchemas,
  getHistorySchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const Historic = ({
  setIsNotFound,
}: {
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
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: { page: page.toString(), pageSize: "10" },
        }),
        schemas: getHistorySchemas,
      }),
  });

  const historic = data ? data.movies : [];
  const totalCount = data ? data.totalCount : 0;

  const { mutate } = useMutation({
    mutationFn: (tmdbId: TTmdbMovieSchema["id"]) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.HISTORY, { tmdbId }),
        schemas: deleteMovieFromHistorySchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER),
      });
      toast.success(t("historic.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("historic.deleteFailed"));
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

  if (page !== 1 && !historic.length) setIsNotFound(true);

  return (
    <div className="flex flex-col gap-5">
      {historic.map(({ ...movie }) => (
        <div key={movie.id} className="flex items-center gap-5">
          <MovieBaseInfo
            movie={movie}
            dir="col"
            posterSize="sm"
            info="partial"
          />
          <Button variant={"destructive"} onClick={() => mutate(movie.id)}>
            <X />
          </Button>
        </div>
      ))}
      {!historic.length && (
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
