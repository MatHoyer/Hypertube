import { AppLoader } from "@/components/ui/app-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getUrl, getYtsMovieDataSchemas, movieSchema } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import z from "zod";
import { NotFoundPage } from "../notFound/NotFound.page";
import MovieInfo from "./components/movie-info";
import MovieInteraction from "./components/movie-interaction";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./components/video-player.context";

export const MoviePageParamsSchema = z.object({
  movieId: movieSchema.shape.id,
});

const MoviePage = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { movieId } = useConvertParams(MoviePageParamsSchema);

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

  if (isLoading) {
    return (
      <div className="size-full flex flex-col justify-center items-center gap-4">
        <AppLoader size={60} />
        <Typography variant="h3">
          {t("global.loadingMessage", {
            resource: t("movie.loadingRessource"),
          })}
        </Typography>
      </div>
    );
  }

  if (!movie) {
    return <NotFoundPage />;
  }

  console.log(movie);

  if (isMobile) {
    return (
      <VideoPlayerProvider>
        <ScrollArea className="col-span-2 h-[calc(100vh)] p-4">
          <div className="flex flex-col gap-4">
            <MovieInfo movie={movie} />
            <VideoPlayer />
            <MovieInteraction />
          </div>
        </ScrollArea>
      </VideoPlayerProvider>
    );
  }

  return (
    <VideoPlayerProvider>
      <div className="grid grid-cols-3 size-full">
        <ScrollArea className="col-span-2 h-[calc(100vh)] p-4">
          <div className="flex flex-col gap-4">
            <VideoPlayer />
            <MovieInteraction />
          </div>
        </ScrollArea>

        <div className="sticky top-0">
          <MovieInfo movie={movie} />
        </div>
      </div>
    </VideoPlayerProvider>
  );
};

export default MoviePage;
