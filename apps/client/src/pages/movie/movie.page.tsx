import { LoadingResource } from "@/components/LoadingResource";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { UniqueFilter } from "@/components/UniqueFilter";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMovieSchemas,
  getMovieSSESchemas,
  getUrl,
  MOVIE_EVENTS,
  ROUTES,
} from "@hypertube/libs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../notFound/NotFound.page";
import { DownloadsSelector } from "./components/downloads-selector/download-selector";
import MovieInfo from "./components/movie-info";
import { MovieInteraction } from "./components/movie-interaction";
import VideoPlayer from "./components/video-player";
import { ResolutionsProvider } from "./contexts/resolutions/resolutions.provider";
import { SubtitlesProvider } from "./contexts/subtitles/subtitles.provider";
import { VideoPlayerProvider } from "./contexts/video-player/video-player.provider";
import { MoviePageParamsSchema } from "./schemas/urlParams.schema";

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

const MovieTabs = {
  VIDEO: "video",
  DOWNLOADS: "downloads",
} as const;
type TMovieTabs = (typeof MovieTabs)[keyof typeof MovieTabs];

const MoviePage = () => {
  const queryClient = useQueryClient();
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<TMovieTabs>(MovieTabs.VIDEO);

  const [watchedTimestamp, setWatchedTimestamp] = useQueryState(
    "t",
    parseAsInteger.withDefault(0)
  );

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery({
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

  useEffect(() => {
    if (!movie) return;
    if (watchedTimestamp) return;
    setWatchedTimestamp(movie.watchedTimestamp);
  }, [movie, watchedTimestamp, setWatchedTimestamp]);

  useEffect(() => {
    const eventSource = new EventSource(
      serverUrl +
        getUrl(ROUTES.API.SSE_MOVIES, {
          tmdbId,
        }),
      { withCredentials: true }
    );
    eventSource.onopen = () => {
      console.log("SSE opened");
    };
    eventSource.onerror = (event: Event) => {
      console.error("SSE error", event);
    };

    const handleResolutionStateChange = (event: MessageEvent<string>) => {
      const { success, data } = getMovieSSESchemas.response[
        MOVIE_EVENTS.RESOLUTION_STATE_CHANGE
      ].safeParse(JSON.parse(event.data));
      if (!success) {
        console.error("invalid downloadStateChange data", event.data);
        return;
      }
      console.log("downloadStateChange", data);
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId }),
      });
    };
    const handleResolutionDownloadProgress = (event: MessageEvent<string>) => {
      const { success, data } = getMovieSSESchemas.response[
        MOVIE_EVENTS.RESOLUTION_DOWNLOAD_PROGRESS
      ].safeParse(JSON.parse(event.data));
      if (!success) {
        console.error("invalid downloadProgress data", event.data);
        return;
      }
      if (data.progress === 0) {
        queryClient.invalidateQueries({
          queryKey: getQueryKey(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId }),
        });
      }
    };
    const handleSubtitleStateChange = (event: MessageEvent<string>) => {
      const { success } = getMovieSSESchemas.response[
        MOVIE_EVENTS.SUBTITLE_STATE_CHANGE
      ].safeParse(JSON.parse(event.data));
      if (!success) {
        console.error("invalid subtitleStateChange data", event.data);
        return;
      }
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_SUBTITLES, { tmdbId }),
      });
    };
    eventSource.addEventListener(
      MOVIE_EVENTS.RESOLUTION_STATE_CHANGE,
      handleResolutionStateChange
    );
    eventSource.addEventListener(
      MOVIE_EVENTS.RESOLUTION_DOWNLOAD_PROGRESS,
      handleResolutionDownloadProgress
    );
    eventSource.addEventListener(
      MOVIE_EVENTS.SUBTITLE_STATE_CHANGE,
      handleSubtitleStateChange
    );

    return () => {
      eventSource.close();
      eventSource.removeEventListener(
        MOVIE_EVENTS.RESOLUTION_STATE_CHANGE,
        handleResolutionStateChange
      );
      eventSource.removeEventListener(
        MOVIE_EVENTS.RESOLUTION_DOWNLOAD_PROGRESS,
        handleResolutionDownloadProgress
      );
      eventSource.removeEventListener(
        MOVIE_EVENTS.SUBTITLE_STATE_CHANGE,
        handleSubtitleStateChange
      );
    };
  }, [tmdbId, queryClient]);

  if (isLoading) return <LoadingResource resource="movie" />;
  if (isError || !movie) return <NotFoundPage />;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 relative">
      <div className="lg:col-start-3 lg:row-start-1 lg:sticky lg:top-4 h-fit">
        <MovieInfo movie={movie.details} />
      </div>
      <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:col-span-2 p-4">
        <div className="flex flex-col gap-1">
          <Tabs value={selectedTab}>
            <TabsList className="bg-transparent">
              <UniqueFilter
                layoutId="movie-tabs"
                className="bg-muted/50"
                value={selectedTab}
                onChange={setSelectedTab}
                values={{
                  [MovieTabs.VIDEO]: t(`movie.tabs.${MovieTabs.VIDEO}`),
                  [MovieTabs.DOWNLOADS]: t(`movie.tabs.${MovieTabs.DOWNLOADS}`),
                }}
              />
            </TabsList>
            <ResolutionsProvider tmdbId={movie.details.id}>
              <SubtitlesProvider tmdbId={movie.details.id}>
                <TabsContent value={MovieTabs.VIDEO}>
                  <VideoPlayerProvider
                    watchedTimestamp={watchedTimestamp}
                    setWatchedTimestamp={setWatchedTimestamp}
                    previewUrl={movie.preview}
                    tmdbId={tmdbId}
                  >
                    <VideoPlayer />
                  </VideoPlayerProvider>
                </TabsContent>
                <TabsContent value={MovieTabs.DOWNLOADS}>
                  <DownloadsSelector />
                </TabsContent>
              </SubtitlesProvider>
            </ResolutionsProvider>
          </Tabs>
        </div>
        <MovieInteraction movie={movie} />
      </div>
    </div>
  );
};

export default MoviePage;
