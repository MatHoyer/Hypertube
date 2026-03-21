import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMovieSubtitlesSchemas,
  getUrl,
  groupBy,
  ROUTES,
  type TGetMovieSubtitlesSchemas,
} from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SubtitlesContext } from "./subtitles.context";

export const SubtitlesProvider: React.FC<{
  children: React.ReactNode;
  tmdbId: TGetMovieSubtitlesSchemas["urlParams"]["tmdbId"];
}> = ({ children, tmdbId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_SUBTITLES, { tmdbId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES_SUBTITLES, { tmdbId }),
        schemas: getMovieSubtitlesSchemas,
      }),
  });

  const filteredSubtitles = useMemo(() => {
    return groupBy(data?.subtitles ?? [], "downloadState");
  }, [data]);

  const streamableSubtitles = useMemo(() => {
    return [...(filteredSubtitles?.DOWNLOADED ?? [])];
  }, [filteredSubtitles]);

  return (
    <SubtitlesContext.Provider
      value={{
        subtitles: data?.subtitles ?? [],
        streamableSubtitles,
        isLoading,
        isError,
      }}
    >
      {children}
    </SubtitlesContext.Provider>
  );
};
