import { LoadingPage } from "@/components/LoadingPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  API_ROUTES,
  getMovieSchemas,
  getMovieSSESchemas,
  getUrl,
  groupBy,
  MOVIE_EVENTS,
} from "@hypertube/libs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../notFound/NotFound.page";
import MovieInfo from "./components/movie-info";
import { MovieInteraction } from "./components/movie-interaction";
import { DownloadsSelector } from "./components/settings-selector";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./components/video-player.context";
import { MoviePageParamsSchema } from "./schemas/urlParams.schema";

const MoviePage = () => {
  const { t } = useTranslation();
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: getQueryKey(API_ROUTES.API_MOVIES, { tmdbId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(API_ROUTES.API_MOVIES, {
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

  useEffect(() => {
    const eventSource = new EventSource(
      getUrl("sse-movies", {
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
        queryKey: getQueryKey(API_ROUTES.API_MOVIES, { tmdbId }),
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
          queryKey: getQueryKey(API_ROUTES.API_MOVIES, { tmdbId }),
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
      resolutions={[
        ...(filteredResolutions?.DOWNLOADED ?? []),
        ...(filteredResolutions?.DOWNLOADING ?? []),
      ]}
      subtitles={[
        ...(filteredSubtitles?.DOWNLOADED ?? []),
        ...(filteredSubtitles?.DOWNLOADING ?? []),
      ]}
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 relative">
        <div className="lg:col-start-3 lg:row-start-1 lg:sticky lg:top-4 h-fit">
          <MovieInfo movie={movie} />
        </div>

        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:col-span-2 p-4">
          <div className="flex flex-col gap-1">
            <Tabs
              defaultValue={
                !!filteredResolutions &&
                ((filteredResolutions.DOWNLOADED &&
                  filteredResolutions.DOWNLOADED.length > 0) ||
                  (filteredResolutions.DOWNLOADING &&
                    filteredResolutions.DOWNLOADING.length > 0))
                  ? "video"
                  : "downloads"
              }
            >
              <TabsList>
                <TabsTrigger value="video">{t("movie.tabs.video")}</TabsTrigger>
                <TabsTrigger value="downloads">
                  {t("movie.tabs.downloads")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="video">
                <VideoPlayer />
              </TabsContent>
              <TabsContent value="downloads">
                <DownloadsSelector
                  resolutions={movie.resolutions ?? []}
                  subtitlesLanguages={movie.subtitles ?? []}
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
