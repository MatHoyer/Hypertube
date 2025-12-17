import { MovieListWithPagination } from "@/components/movies/MovieListWithPagination";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieFromHistorySchemas,
  getUrl,
  ROUTES,
  type TGetHistorySchemas,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Historic: React.FC<{
  historicPage: TGetHistorySchemas["response"];
  historicPageSize: number;
}> = ({ historicPage, historicPageSize }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
    <MovieListWithPagination
      movieListType="historic"
      movies={historicPage.movies}
      pageSize={historicPageSize}
      totalCount={historicPage.totalCount}
      deleteFn={(tmdbId: number) => mutate({ tmdbId })}
    />
  );
};
