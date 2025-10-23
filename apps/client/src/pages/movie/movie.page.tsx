import { LoadingPage } from "@/components/LoadingPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  getMovieSchemas,
  getUrl,
  groupBy,
  SSEEvents,
  type TGetMovieSSESchemas,
} from "@hypertube/libs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../notFound/NotFound.page";
import MovieInfo from "./components/movie-info";
import MovieInteraction from "./components/movie-interaction";
import { DownloadsSelector } from "./components/settings-selector";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./components/video-player.context";
import { MoviePageParamsSchema } from "./schemas/urlParams.schema";

const MoviePage = () => {
  const { t } = useTranslation();
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", tmdbId],
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl("api-movies", {
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

    const handleDownloadStateChange = (
      event: MessageEvent<
        TGetMovieSSESchemas["response"]["downloadStateChange"]
      >
    ) => {
      console.log("downloadStateChange", event.data);
      queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
    };
    const handleDownloadProgress = (
      event: MessageEvent<TGetMovieSSESchemas["response"]["downloadProgress"]>
    ) => {
      console.log(SSEEvents.DOWNLOAD_PROGRESS, event.data);
      if (event.data.progress === 0) {
        console.log("movie download started");
        queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
      }
    };
    eventSource.addEventListener(
      SSEEvents.DOWNLOAD_STATE_CHANGE,
      handleDownloadStateChange
    );
    eventSource.addEventListener(
      SSEEvents.DOWNLOAD_PROGRESS,
      handleDownloadProgress
    );

    return () => {
      eventSource.close();
      eventSource.removeEventListener(
        SSEEvents.DOWNLOAD_STATE_CHANGE,
        handleDownloadStateChange
      );
      eventSource.removeEventListener(
        SSEEvents.DOWNLOAD_PROGRESS,
        handleDownloadProgress
      );
    };
  }, [tmdbId]);

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
          <MovieInteraction />
        </div>
      </div>
    </VideoPlayerProvider>
  );
};

export default MoviePage;
