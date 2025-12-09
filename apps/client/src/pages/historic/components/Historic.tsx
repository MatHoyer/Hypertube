import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
import { MovieListWithPagination } from "@/components/movies/MovieListWithPagination";
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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const pageSize = 10;

export const Historic = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, _] = useQueryState("page", parseAsInteger.withDefault(1));

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

  if (isPending) return <LoadingResource resource="historic" />;
  if (isError) return <ErrorResource resource="historic" />;

  return (
    <MovieListWithPagination
      movieListType="historic"
      movies={data ? data.movies : []}
      pageSize={pageSize}
      totalCount={data ? data.totalCount : 0}
      deleteFn={(tmdbId: number) => mutate({ tmdbId })}
    />
  );
};
