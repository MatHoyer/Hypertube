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
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieFromHistorySchemas,
  getHistorySchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const Historic = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [_, setSearchParams] = useSearchParams();
  const pageSize = 10;

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
          searchParams: {
            page: page.toString(),
            pageSize: pageSize.toString(),
          },
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

  if (isPending) return <LoadingResource resource="historic" />;
  if (isError) return <ErrorResource resource="historic" />;

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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>{t("historic.empty")}</EmptyTitle>
              <EmptyDescription>
                {t("historic.emptyDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
      <PagePagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
};
