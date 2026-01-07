import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieList } from "@/components/movies/MovieList";
import { PagePagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { FloatingBar } from "@/components/ui/FloatingBar";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteHistorySchemas,
  deleteMovieFromHistorySchemas,
  getHistorySchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const historicPageSize = 10;

export const HistoricPage = () => {
  const { scrollTo } = useScrollArea();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, isPlaceholderData, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: {
            page,
            pageSize: historicPageSize,
          },
        }),
        schemas: getHistorySchemas,
      }),
    placeholderData: (previousData) => previousData,
  });

  const { mutate: deleteMutation } = useMutation({
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

  const { mutate: deleteAllMutation } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.HISTORY),
        schemas: deleteHistorySchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER),
      });
      toast.success(t("historic.deleteAllSuccess"));
    },
    onError: () => {
      toast.error(t("historic.deleteAllFailed"));
    },
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource resource="historic" count={data?.total ?? 0} />
        <LayoutActions className="w-full">
          <Button onClick={() => deleteAllMutation()}>
            {t("historic.deleteAll")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        {data && !isPlaceholderData && (
          <MovieList
            movieListType="historic"
            movies={data.movies}
            deleteFn={(tmdbId) => deleteMutation({ tmdbId })}
          />
        )}
        {(isLoading || isPlaceholderData) && (
          <LoadingResource resource="historic" />
        )}
        {isError && <ErrorResource resource="historic" />}
        {(data?.total ?? 0) > historicPageSize && (
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
