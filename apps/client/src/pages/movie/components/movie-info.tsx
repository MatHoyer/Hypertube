import { ImageContainer } from "@/components/images/ImageContainer";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { getUrl, type TGetMovieSchemas } from "@hypertube/libs";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const MovieInfo: React.FC<{
  movie: Omit<TGetMovieSchemas["response"], "resolutions" | "subtitles">;
}> = ({ movie }) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-center">
        <ImageContainer
          imageSrc={movie.poster_path}
          altImage="Movie Poster"
          size="lg"
        >
          <Typography variant="h3">{movie.title}</Typography>
        </ImageContainer>
      </div>
      <div className="flex flex-col gap-2">
        <Link
          to={getUrl("external-imdb-movie", {
            imdbId: movie.imdbId ?? "",
          })}
          target="_blank"
        >
          <Typography variant="h1" className="text-center hover:underline">
            {movie.title}
          </Typography>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <Badge>{movie.original_language.toUpperCase()}</Badge>
          <Badge>{movie.release_date}</Badge>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {movie.genres.map((genre, index) => (
            <Badge variant="outline" key={index}>
              {genre.name.toLowerCase()}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Star className="text-primary fill-primary" />
          <Typography variant="mono">
            {movie.vote_average.toFixed(1)}/10
          </Typography>
        </div>
        <Typography variant="muted" className="text-start">
          {movie.overview}
        </Typography>
      </div>
      {/* {actors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("movie.cast")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {actors.map((person, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <ImageAvatar
                        name={person.name}
                        imageSrc={person.imageUrl ?? ""}
                        size="sm"
                      />
                      <Typography>{person.name}</Typography>
                    </div>
                    {person.imdbId && (
                      <Button variant="outline" className="group" asChild>
                        <Link
                          to={getUrl("external-imdb-actor", {
                            imdbId: person.imdbId,
                          })}
                          target="_blank"
                        >
                          <img
                            src="/images/IMDB_text_yellow.svg"
                            alt="IMDB"
                            className="inline-block w-12 h-12"
                          />
                          <ArrowRightIcon className="group-hover:-rotate-45 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  {index !== actors.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )} */}
    </div>
  );
};

export default MovieInfo;
