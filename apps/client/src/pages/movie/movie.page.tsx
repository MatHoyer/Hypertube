import { LoadingPage } from "@/components/LoadingPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getMovieSchemas, getUrl, groupBy } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
