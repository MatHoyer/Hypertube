import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import type { TTmdbMovieCompleteSchema } from "@hypertube/libs/src/schemas/api/movie.schema";
import { Casting } from "./movie-casting";

const MovieInfo: React.FC<{
  movie: TTmdbMovieCompleteSchema;
}> = ({ movie }) => {
  return (
    <div className="flex flex-col gap-4 m-5 h-full">
      <MovieBaseInfo movie={movie} />
      <Casting tmdbId={movie.id} />
    </div>
  );
};

export default MovieInfo;
