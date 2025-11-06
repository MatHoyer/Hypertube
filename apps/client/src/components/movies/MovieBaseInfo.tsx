import { cn } from "@/lib/utils";
import { type TTmdbMovieSchema } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { ImageContainer } from "../images/ImageContainer";
import { Badge } from "../ui/badge";
import { Typography } from "../ui/typography";
import { ScoreRated } from "./ScoreRated";

type TMovieBaseInfo = Omit<TTmdbMovieSchema, "id">;

export const MovieBaseInfo: React.FC<{
  movie: TMovieBaseInfo;
  truncate?: boolean;
}> = ({ movie, truncate = false }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center w-full gap-2 text-center">
      <ImageContainer
        imageSrc={movie.poster_path}
        altImage={movie.title}
        size={truncate ? "md" : "lg"}
      />
      <Typography variant="h1">{movie.title}</Typography>
      <div className="flex gap-2">
        <Typography variant="muted" className={cn(truncate && "line-clamp-1")}>
          {movie.original_title}
        </Typography>
        <Badge variant={"outline"}>
          {movie.original_language.toUpperCase()}
        </Badge>
      </div>
      <Typography className={cn(truncate && "line-clamp-5")}>
        {movie.overview || t("movie.page.missing.desc")}
      </Typography>
      <div className="flex gap-2 justify-center">
        {movie.genres.map(({ name }, i) => (
          <Badge key={i} variant={"outline"}>
            {name}
          </Badge>
        ))}
      </div>
      <div className="flex justify-between w-full">
        <Badge>{movie.release_date}</Badge>
        <ScoreRated score={movie.vote_average} />
      </div>
    </div>
  );
};
