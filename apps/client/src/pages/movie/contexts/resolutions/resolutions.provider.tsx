import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMovieResolutionsSchemas,
  getUrl,
  groupBy,
  ROUTES,
  type TGetMovieResolutionsSchemas,
} from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ResolutionsContext } from "./resolutions.context";

export const ResolutionsProvider: React.FC<{
  children: React.ReactNode;
  tmdbId: TGetMovieResolutionsSchemas["urlParams"]["tmdbId"];
}> = ({ children, tmdbId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId }),
        schemas: getMovieResolutionsSchemas,
      }),
  });

  const filteredResolutions = useMemo(() => {
    return groupBy(data?.resolutions ?? [], "downloadState");
  }, [data]);

  const streamableResolutions = useMemo(() => {
    return [...(filteredResolutions?.DOWNLOADED ?? [])];
  }, [filteredResolutions]);

  return (
    <ResolutionsContext.Provider
      value={{
        resolutions: data?.resolutions ?? [],
        streamableResolutions,
        isLoading,
        isError,
      }}
    >
      {children}
    </ResolutionsContext.Provider>
  );
};
