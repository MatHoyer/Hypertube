import { LoadingPage } from "@/components/LoadingPage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  getUrl,
  getYtsMovieDataSchemas,
  groupBy,
  movieSchema,
} from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { NotFoundPage } from "../notFound/NotFound.page";
import MovieInfo from "./components/movie-info";
import MovieInteraction from "./components/movie-interaction";
import { SettingsSelector } from "./components/settings-selector";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./components/video-player.context";

export const MoviePageParamsSchema = z.object({
  movieId: movieSchema.shape.id,
});

const MoviePage = () => {
  const { movieId } = useConvertParams(MoviePageParamsSchema);

  const [selectedResolution, setSelectedResolution] = useQueryState(
    "resolution",
    parseAsString.withDefault("")
  );
  const [selectedSubtitlesLanguage, setSelectedSubtitlesLanguage] =
    useQueryState("subtitlesLanguage", parseAsString.withDefault(""));

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl("api-movie", {
          scrapper: "yts",
          movieId,
        }),
        schemas: getYtsMovieDataSchemas,
      }),
  });

  const filteredResolutions = useMemo(() => {
    if (!movie) return [];
    return groupBy(movie.resolutions, "downloadState");
  }, [movie]);

  if (isLoading) {
    return <LoadingPage resource="movie" />;
  }

  if (!movie) {
    return <NotFoundPage />;
  }

  return (
    <VideoPlayerProvider>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
        <div className="lg:col-start-3 lg:row-start-1 lg:sticky lg:top-0">
          <MovieInfo movie={movie} />
        </div>

        <ScrollArea className="lg:col-start-1 lg:row-start-1 lg:col-span-2 lg:h-[calc(100vh)] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Tabs
                defaultValue={
                  Array.isArray(filteredResolutions)
                    ? "video"
                    : filteredResolutions?.NOT_DOWNLOADED?.length > 0
                    ? "settings"
                    : "video"
                }
              >
                <TabsList>
                  <TabsTrigger value="video">
                    {t("movie.tabs.video")}
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    {t("movie.tabs.settings")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="video">
                  <VideoPlayer />
                </TabsContent>
                <TabsContent value="settings">
                  <SettingsSelector
                    resolutions={
                      Array.isArray(filteredResolutions)
                        ? []
                        : filteredResolutions?.NOT_DOWNLOADED ?? []
                    }
                    selectedResolution={selectedResolution}
                    setSelectedResolution={setSelectedResolution}
                    subtitlesLanguages={movie.subtitles}
                    selectedSubtitlesLanguage={selectedSubtitlesLanguage}
                    setSelectedSubtitlesLanguage={setSelectedSubtitlesLanguage}
                  />
                </TabsContent>
              </Tabs>
            </div>
            <MovieInteraction />
          </div>
        </ScrollArea>
      </div>
    </VideoPlayerProvider>
  );
};

export default MoviePage;
