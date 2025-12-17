import { getUrl, ROUTES, type TTmdbMovieCompleteSchema } from "@hypertube/libs";
import { Video, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { MovieBaseInfo } from "./MovieBaseInfo";

const movieListTypes = ["historic", "playlist"] as const;

export const MovieList: React.FC<{
  movieListType: (typeof movieListTypes)[number];
  movies: { details: TTmdbMovieCompleteSchema }[];
  deleteFn: (tmdbId: number) => void;
}> = ({ movieListType, movies, deleteFn }) => {
  const { t } = useTranslation();

  if (!movieListTypes.includes(movieListType)) return null;

  return (
    <div className="flex flex-col gap-2">
      {movies.map((movie) => (
        <Link
          key={movie.details.id}
          to={getUrl(ROUTES.CLIENT.MOVIE, { tmdbId: movie.details.id })}
        >
          <Card className="flex sm:flex-row items-center gap-4 p-2 hover:bg-card/20 cursor-pointer">
            <MovieBaseInfo
              movie={movie.details}
              dir="col"
              posterSize="sm"
              info="partial"
            />
            <Button
              className="w-full sm:w-min"
              variant={"destructive"}
              onClick={(event) => {
                event.preventDefault();
                deleteFn(movie.details.id);
              }}
            >
              <X />
            </Button>
          </Card>
        </Link>
      ))}
      {!movies.length && (
        <div className="flex justify-center items-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Video />
              </EmptyMedia>
              <EmptyTitle>{t(`${movieListType}.empty`)}</EmptyTitle>
              <EmptyDescription>
                {t(`${movieListType}.emptyDescription`)}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
};
