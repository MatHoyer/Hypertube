import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieList } from "@/components/movies/MovieList";
import { PagePagination } from "@/components/Pagination";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
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
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const historicPageSize = 10;

export const HistoricPage = () => {
  const { scrollTo } = useScrollArea();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [totalCount, setTotalCount] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: {
            page: page.toString(),
            pageSize: historicPageSize.toString(),
          },
        }),
        schemas: getHistorySchemas,
      }),
  });

  useEffect(() => {
    if (data) setTotalCount(data.totalCount);
  }, [data, setTotalCount]);

  const { mutate } = useMutation({
    mutationFn: ({ tmdbId }: { tmdbId: TTmdbMovieSchema["id"] }) =>
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

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource resource="historic" count={totalCount} />
      </LayoutHeader>
      <LayoutContent>
        {data && (
          <MovieList
            movieListType="historic"
            movies={data.movies}
            deleteFn={(tmdbId: number) => mutate({ tmdbId })}
          />
        )}
        {isLoading && <LoadingResource resource="historic" />}
        {isError && <ErrorResource resource="historic" />}
        {totalCount > historicPageSize && (
          <FloatingBar>
            <PagePagination
              page={page}
              setPage={(value) => {
                setPage(value);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              maxPage={Math.ceil(totalCount / historicPageSize)}
            />
          </FloatingBar>
        )}
      </LayoutContent>
    </Layout>
  );
};
