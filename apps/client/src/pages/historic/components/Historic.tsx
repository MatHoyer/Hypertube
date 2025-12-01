import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Button } from "@/components/ui/button";
import { useUserHistoric } from "@/hooks/use-historic";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieFromHistorySchemas,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

export const Historic = () => {
  const queryClient = useQueryClient();
  const historic = useUserHistoric();

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
    },
  });

  return (
    <>
      {historic.map(({ ...movie }) => (
        <div className="flex items-center gap-5">
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
    </>
  );
};
