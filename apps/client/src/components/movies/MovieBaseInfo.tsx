import { cn } from "@/lib/utils";
import { type TTmdbMovieSchema } from "@hypertube/libs";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { ImageContainer } from "../images/ImageContainer";
import { Badge } from "../ui/badge";
import { Typography } from "../ui/typography";
import { ScoreRated } from "./ScoreRated";

const DisplayGenresMovie: React.FC<{
  genres: { name: string; id: number }[];
  displayOnlyOne?: boolean;
}> = ({ genres, displayOnlyOne = false }) => {
  const { t } = useTranslation();

  if (displayOnlyOne) {
    return (
      <>
        {genres.length ? (
          <div className="flex justify-center gap-2 w-full">
            <Badge variant={"outline"}>{genres[0].name}</Badge>
            {genres.length > 1 && (
              <Badge variant={"outline"}>+{genres.length - 1}</Badge>
            )}
          </div>
        ) : (
          <Typography variant="muted" className="text-center">
            {t("movie.page.missing.genres")}
          </Typography>
        )}
      </>
    );
  }
  return (
    <>
      {genres.map(({ name }, i) => (
        <Badge key={i} variant={"outline"}>
          {name}
        </Badge>
      ))}
    </>
  );
};

export const MovieBaseInfo: React.FC<
  ComponentProps<"div"> & {
    movie: Omit<TTmdbMovieSchema, "id">;
    posterSize?: "lg" | "md" | "sm";
    info?: "all" | "partial";
    truncate?: boolean;
  }
> = ({
  movie,
  posterSize = "lg",
  info = "all",
  truncate = false,
  className,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full gap-2 text-center",
        className
      )}
      {...props}
    >
      <ImageContainer
        imageSrc={movie.poster_path}
        altImage={movie.title}
        size={posterSize}
      />
      {info === "partial" ? (
        <Typography variant="large" className="line-clamp-1">
          {movie.title}
        </Typography>
      ) : (
        <>
          <Typography variant="h1">{movie.title}</Typography>
          <div className="flex gap-2">
            <Typography
              variant="muted"
              className={cn(truncate && "line-clamp-1")}
            >
              {movie.original_title}
            </Typography>
            <Badge variant={"outline"}>
              {movie.original_language.toUpperCase()}
            </Badge>
          </div>
          <Typography className={cn(truncate && "line-clamp-5")}>
            {movie.overview || t("movie.page.missing.desc")}
          </Typography>
        </>
      )}
      <div className="flex gap-2 justify-center">
        <DisplayGenresMovie
          genres={movie.genres}
          displayOnlyOne={info === "partial"}
        />
      </div>
      <div className="flex justify-between w-full gap-2">
        <Badge>{movie.release_date || t("movie.page.missing.date")}</Badge>
        <ScoreRated score={movie.vote_average} />
      </div>
    </div>
  );
};
