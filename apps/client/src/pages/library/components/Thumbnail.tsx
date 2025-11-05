import { openDialog } from "@/components/dialogs/dialog.store";
import { ImageContainer } from "@/components/images/ImageContainer";
import { ScoreRated } from "@/components/movies/ScoreRated";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { TTmdbMovieSchema } from "@hypertube/libs";
import { useTranslation } from "react-i18next";

export const Thumbnail: React.FC<{ movie: TTmdbMovieSchema }> = ({ movie }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="flex p-4 md:pt-7 items-center"
      onClick={() => openDialog("movie", movie)}
    >
      <ImageContainer
        imageSrc={movie.poster_path}
        altImage={movie.title}
        size="md"
      />
      <div className="flex flex-col items-center gap-2 w-full">
        <Typography variant="large" className="text-center line-clamp-1">
          {movie.title}
        </Typography>
        {movie.genres.length ? (
          <div className="flex justify-center gap-2 w-full">
            <Badge variant={"outline"}>{movie.genres[0].name}</Badge>
            {movie.genres.length > 1 && (
              <Badge variant={"outline"}>+{movie.genres.length - 1}</Badge>
            )}
          </div>
        ) : (
          <Typography variant="muted" className="text-center">
            {t("movie.page.missing.genres")}
          </Typography>
        )}
        <div className="flex flex-col md:flex-row gap-2 items-center w-full justify-between">
          <Badge>{movie.release_date || t("movie.page.missing.date")}</Badge>
          <ScoreRated score={movie.vote_average} />
        </div>
      </div>
    </Card>
  );
};
