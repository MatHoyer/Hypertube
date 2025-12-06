import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUrl, ROUTES } from "@hypertube/libs";
import type { TTmdbMovieCompleteSchema } from "@hypertube/libs/src/schemas/api/movie.schema";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const MovieDialog: React.FC<{ movie: TTmdbMovieCompleteSchema }> = ({
  movie,
}) => {
  return (
    <DialogContent className="flex flex-col items-center">
      <VisuallyHidden>
        <DialogTitle />
        <DialogDescription />
      </VisuallyHidden>
      <MovieBaseInfo movie={movie} posterSize="md" truncate />
      <DialogFooter className="w-full">
        <DialogClose asChild>
          <Button variant={"outline"} className="w-full" asChild>
            <Link to={getUrl(ROUTES.CLIENT.MOVIE, { tmdbId: movie.id })}>
              <PlayCircle />
            </Link>
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
