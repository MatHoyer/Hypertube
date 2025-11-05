import { closeDialog } from "@/components/dialogs/dialog.store";
import { ImageContainer } from "@/components/images/ImageContainer";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUrl, type TTmdbMovieSchema } from "@hypertube/libs";
import { PlayCircle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const MovieDialog: React.FC<{ movie: TTmdbMovieSchema }> = ({
  movie,
}) => {
  const { t } = useTranslation();

  return (
    <DialogContent className="flex flex-col items-center">
      <ImageContainer
        imageSrc={movie.poster_path}
        altImage={movie.title}
        size="md"
      />
      <div className="w-full">
        <DialogHeader>
          <DialogTitle>{movie.title}</DialogTitle>
          <DialogDescription>
            {movie.overview || t("movie.page.missing.desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 m-2">
          <div className="col-span-2">
            {movie.genres.length
              ? movie.genres.map(({ name }) => name).join(" / ")
              : t("movie.page.missing.genres")}
          </div>
          <div className="flex items-center justify-end gap-1">
            {movie.vote_average.toPrecision(2)}/10
            <Star fill="yellow" color="black" />
          </div>
        </div>
        <DialogFooter>
          <Button variant={"outline"} className="w-full" asChild>
            <Link
              to={getUrl("client-movie", { tmdbId: movie.id })}
              onClick={() => closeDialog()}
            >
              <PlayCircle />
            </Link>
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};
