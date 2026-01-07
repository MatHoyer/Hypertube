import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { openAlertDialog } from "@/components/dialogs/alert-dialog.store";
import { ErrorResource } from "@/components/ErrorResource";
import { FloatingPagePagination } from "@/components/FloatingPagePagination";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieList } from "@/components/movies/MovieList";
import { Button } from "@/components/ui/button";
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

export const HistoricPage = () => {
  const { scrollTo } = useScrollArea();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: { page },
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
      if (data?.movies.length === 1) setPage(1);
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
      setPage(1);
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
          <Button
            disabled={!data?.total}
            onClick={() => {
              openAlertDialog(() => deleteAllMutation());
            }}
          >
            {t("historic.deleteAll")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        {data && (
          <MovieList
            movieListType="historic"
            movies={data.movies}
            deleteFn={(tmdbId) => deleteMutation({ tmdbId })}
          />
        )}
        {isLoading && <LoadingResource resource="historic" />}
        {isError && <ErrorResource resource="historic" />}
        <FloatingPagePagination
          page={page}
          setPage={(value) => {
            setPage(value);
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          maxPage={data?.totalPages ?? 0}
        />
      </LayoutContent>
    </Layout>
  );
};
