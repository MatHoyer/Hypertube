import { cn } from "@/lib/utils";
import { getUrl, ROUTES } from "@hypertube/libs";
import type { TTmdbMovieCompleteSchema } from "@hypertube/libs/src/schemas/api/movie.schema";
import { ExternalLink } from "lucide-react";
import type { ComponentProps, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ImageContainer } from "../images/ImageContainer";
import { Badge } from "../ui/badge";
import { Typography } from "../ui/typography";
import { ScoreRated } from "./ScoreRated";

const MovieBaseInfoLayout: React.FC<
  {
    dir: "row" | "col";
  } & ComponentProps<"div"> &
    PropsWithChildren
> = ({ dir, className, children, ...props }) => {
  return (
    <div
      className={cn(
        dir === "row" && "flex flex-col items-center w-full gap-2 text-center",
        dir === "col" &&
          "flex flex-col sm:grid sm:grid-cols-[1fr_4fr_1fr_1fr] items-center w-full gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DisplayGenresMovie: React.FC<{
  genres: { name: string; id: number }[];
  displayOnlyOne?: boolean;
}> = ({ genres, displayOnlyOne = false }) => {
  const { t } = useTranslation();

  if (!genres.length)
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        <Typography textColor="muted">{t("library.missing.genres")}</Typography>
      </div>
    );

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {displayOnlyOne ? (
        <div className="flex justify-center gap-2 w-full">
          <Badge variant={"outline"}>{genres[0].name}</Badge>
          {genres.length > 1 && (
            <Badge variant={"outline"}>+{genres.length - 1}</Badge>
          )}
        </div>
      ) : (
        genres.map(({ name }, i) => (
          <Badge key={i} variant={"outline"}>
            {name}
          </Badge>
        ))
      )}
    </div>
  );
};

export const MovieBaseInfo: React.FC<
  ComponentProps<"div"> & {
    movie: TTmdbMovieCompleteSchema;
    dir?: "row" | "col";
    posterSize?: "lg" | "md" | "sm";
    info?: "all" | "partial";
    truncate?: boolean;
  }
> = ({
  movie,
  dir = "row",
  posterSize = "lg",
  info = "all",
  truncate = false,
  className,
  ...props
}) => {
  const { t } = useTranslation();

  if (!movie.hasDetails) {
    return (
      <MovieBaseInfoLayout dir={dir} className={className} {...props}>
        <ImageContainer imageSrc={null} altImage={"?"} size={posterSize} />
        <Typography
          textSize="lg"
          className="sm:col-span-3 text-center sm:text-start"
        >
          {t("movie.noDetails")}
        </Typography>
      </MovieBaseInfoLayout>
    );
  }

  return (
    <MovieBaseInfoLayout dir={dir} className={className} {...props}>
      <ImageContainer
        imageSrc={movie.poster_path}
        altImage={movie.title}
        size={posterSize}
      />
      {info === "partial" ? (
        <Typography textSize="lg" className="line-clamp-1">
          {movie.title}
        </Typography>
      ) : (
        <>
          <Typography variant="h1">{movie.title}</Typography>
          <div className="flex gap-2">
            <Typography
              textColor="muted"
              className={cn(truncate && "line-clamp-1")}
            >
              {movie.original_title}
            </Typography>
            <Badge variant={"outline"}>
              {movie.original_language.toUpperCase()}
            </Badge>
            {movie.imdb_id && (
              <Link
                to={getUrl(ROUTES.EXTERNAL.IMDB_MOVIE, {
                  imdbId: movie.imdb_id,
                })}
                target="_blank"
              >
                <Badge className="flex h-full">
                  IMDb
                  <ExternalLink />
                </Badge>
              </Link>
            )}
          </div>
          <Typography className={cn(truncate && "line-clamp-5")}>
            {movie.overview || t("library.missing.desc")}
          </Typography>
        </>
      )}
      <DisplayGenresMovie
        genres={movie.genres}
        displayOnlyOne={info === "partial"}
      />
      <div
        className={cn(
          dir === "row" && info === "partial" && "flex-col sm:flex-row",
          "flex justify-between items-center w-full gap-2"
        )}
      >
        <Badge>{movie.release_date || t("library.missing.date")}</Badge>
        <ScoreRated score={movie.vote_average} voteCount={movie.vote_count} />
      </div>
    </MovieBaseInfoLayout>
  );
};
