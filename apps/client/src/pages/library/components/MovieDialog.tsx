import { ImageContainer } from "@/components/images/ImageContainer";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUrl, type TGetMoviesSchemas } from "@hypertube/libs";
import { PlayCircle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const MovieDialog: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = ({ movie }) => {
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
            {movie.overview || t("movie.page.missing.noDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 m-2">
          <div className="col-span-2">
            {movie.genres.length
              ? movie.genres.map(({ name }) => name).join(" / ")
              : t("movie.page.missing.noGenres")}
          </div>
          <div className="flex items-center justify-end gap-1">
            {movie.vote_average.toPrecision(2)}/10
            <Star fill="yellow" color="black" />
          </div>
        </div>
        <DialogFooter>
          <Button variant={"outline"} className="w-full" asChild>
            <Link to={getUrl("client-movie", { tmdbId: movie.id })}>
              <PlayCircle />
            </Link>
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};
