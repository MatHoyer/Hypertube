import { openDialog } from "@/components/dialogs/dialog.store";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Card } from "@/components/ui/card";
import type { TTmdbMovieSchema } from "@hypertube/libs";

export const Thumbnail: React.FC<{ movie: TTmdbMovieSchema }> = ({ movie }) => {
  return (
    <Card
      className="flex p-2 md:p-4 items-center"
      onClick={() => openDialog("movie", movie)}
    >
      <MovieBaseInfo movie={movie} posterSize="md" info="partial" />
    </Card>
  );
};
