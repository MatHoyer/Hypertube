import { UniqueFilter } from "@/components/animated/UniqueFilter";
import { LoadingPage } from "@/components/LoadingPage";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMovieSchemas,
  getMovieSSESchemas,
  getUrl,
  groupBy,
  MOVIE_EVENTS,
  ROUTES,
} from "@hypertube/libs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../notFound/NotFound.page";
import { DownloadsSelector } from "./components/downloads-selector/download-selector";
import MovieInfo from "./components/movie-info";
import { MovieInteraction } from "./components/movie-interaction";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./contexts/video-player/video-player.provider";
import { MoviePageParamsSchema } from "./schemas/urlParams.schema";

const MovieTabs = {
  VIDEO: "video",
  DOWNLOADS: "downloads",
} as const;
type TMovieTabs = (typeof MovieTabs)[keyof typeof MovieTabs];

const MoviePage = () => {
  const { t } = useTranslation();
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const [selectedTab, setSelectedTab] = useState<TMovieTabs>(MovieTabs.VIDEO);

  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES, { tmdbId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES, {
          tmdbId,
        }),
        schemas: getMovieSchemas,
      }),
  });

  const filteredResolutions = useMemo(() => {
    if (!movie) return null;
    return groupBy(movie.resolutions, "downloadState");
  }, [movie]);

  const filteredSubtitles = useMemo(() => {
    if (!movie) return null;
    return groupBy(movie.subtitles, "downloadState");
  }, [movie]);

  const streamableResolutions = useMemo(() => {
    return [
      ...(filteredResolutions?.DOWNLOADED ?? []),
      ...(filteredResolutions?.DOWNLOADING ?? []),
    ];
  }, [filteredResolutions]);

  const streamableSubtitles = useMemo(() => {
    return [
      ...(filteredSubtitles?.DOWNLOADED ?? []),
      ...(filteredSubtitles?.DOWNLOADING ?? []),
    ];
  }, [filteredSubtitles]);

  useEffect(() => {
    if (
      filteredResolutions &&
      !filteredResolutions?.DOWNLOADING?.length &&
      !filteredResolutions?.DOWNLOADED?.length
    ) {
      setSelectedTab(MovieTabs.DOWNLOADS);
    }
  }, [filteredResolutions]);

  useEffect(() => {
    const eventSource = new EventSource(
      getUrl(ROUTES.API.SSE_MOVIES, {
        tmdbId,
      })
    );
    eventSource.onopen = () => {
      console.log("SSE opened");
    };
    eventSource.onerror = (event: Event) => {
      console.error("SSE error", event);
    };

    const handleDownloadStateChange = (event: MessageEvent<string>) => {
      const { success, data } =
        getMovieSSESchemas.response.downloadStateChange.safeParse(
          JSON.parse(event.data)
        );
      if (!success) {
        console.error("invalid downloadStateChange data", event.data);
        return;
      }
      console.log("downloadStateChange", data);
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES, { tmdbId }),
      });
    };
    const handleDownloadProgress = (event: MessageEvent<string>) => {
      const { success, data } =
        getMovieSSESchemas.response.downloadProgress.safeParse(
          JSON.parse(event.data)
        );
      if (!success) {
        console.error("invalid downloadProgress data", event.data);
        return;
      }
      if (data.progress === 0) {
        console.log("movie download started");
        queryClient.invalidateQueries({
          queryKey: getQueryKey(ROUTES.API.MOVIES, { tmdbId }),
        });
      }
    };
    eventSource.addEventListener(
      MOVIE_EVENTS.DOWNLOAD_STATE_CHANGE,
      handleDownloadStateChange
    );
    eventSource.addEventListener(
      MOVIE_EVENTS.DOWNLOAD_PROGRESS,
      handleDownloadProgress
    );

    return () => {
      eventSource.close();
      eventSource.removeEventListener(
        MOVIE_EVENTS.DOWNLOAD_STATE_CHANGE,
        handleDownloadStateChange
      );
      eventSource.removeEventListener(
        MOVIE_EVENTS.DOWNLOAD_PROGRESS,
        handleDownloadProgress
      );
    };
  }, [tmdbId, queryClient]);

  if (isLoading) {
    return <LoadingPage resource="movie" />;
  }

  if (!movie) {
    return <NotFoundPage />;
  }

  return (
    <VideoPlayerProvider
      resolutions={streamableResolutions}
      subtitles={streamableSubtitles}
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 relative">
        <div className="lg:col-start-3 lg:row-start-1 lg:sticky lg:top-4 h-fit">
          <MovieInfo movie={movie} />
        </div>

        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:col-span-2 p-4">
          <div className="flex flex-col gap-1">
            <Tabs value={selectedTab}>
              <TabsList className="bg-transparent">
                <UniqueFilter
                  value={selectedTab}
                  onChange={(value) => setSelectedTab(value as TMovieTabs)}
                  values={{
                    [MovieTabs.VIDEO]: t(`movie.tabs.${MovieTabs.VIDEO}`),
                    [MovieTabs.DOWNLOADS]: t(
                      `movie.tabs.${MovieTabs.DOWNLOADS}`
                    ),
                  }}
                />
              </TabsList>
              <TabsContent value={MovieTabs.VIDEO}>
                <VideoPlayer />
              </TabsContent>
              <TabsContent value={MovieTabs.DOWNLOADS}>
                <DownloadsSelector
                  resolutions={movie.resolutions}
                  subtitlesLanguages={movie.subtitles}
                />
              </TabsContent>
            </Tabs>
          </div>
          <MovieInteraction
            tmdbId={movie.tmdbId}
            isSubscribed={movie.isSubscribed}
          />
        </div>
      </div>
    </VideoPlayerProvider>
  );
};

export default MoviePage;
