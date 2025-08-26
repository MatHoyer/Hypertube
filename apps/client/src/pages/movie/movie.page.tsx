import { ScrollArea } from "@/components/ui/scroll-area";
import { useConvertParams } from "@/hooks/use-convert-params";
import { movieSchema } from "@hypertube/libs";
import z from "zod";
import MovieInfo from "./components/movie-info";
import MovieInteraction from "./components/movie-interaction";
import VideoPlayer from "./components/video-player";
import { VideoPlayerProvider } from "./components/video-player.context";

export const MoviePageParamsSchema = z.object({
  movieId: movieSchema.shape.id,
});

const MoviePage = () => {
  const { movieId } = useConvertParams(MoviePageParamsSchema);
  console.log(movieId);

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
          <MovieInfo />
        </div>
      </div>
    </VideoPlayerProvider>
  );
};

export default MoviePage;
