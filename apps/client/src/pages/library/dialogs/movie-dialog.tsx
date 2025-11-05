import { closeDialog } from "@/components/dialogs/dialog.store";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { getUrl, type TTmdbMovieSchema } from "@hypertube/libs";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const MovieDialog: React.FC<{ movie: TTmdbMovieSchema }> = ({
  movie,
}) => {
  return (
    <DialogContent className="flex flex-col items-center">
      <MovieBaseInfo movie={movie} truncate />
      <DialogFooter className="w-full">
        <Button variant={"outline"} className="w-full" asChild>
          <Link
            to={getUrl("client-movie", { tmdbId: movie.id })}
            onClick={() => closeDialog()}
          >
            <PlayCircle />
          </Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
