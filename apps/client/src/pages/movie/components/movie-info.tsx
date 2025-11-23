import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { type TGetMovieSchemas } from "@hypertube/libs";

const MovieInfo: React.FC<{
  movie: Omit<
    NonNullable<TGetMovieSchemas["response"]>,
    "resolutions" | "subtitles"
  >;
}> = ({ movie }) => {
  return (
    <div className="flex flex-col gap-4 m-5 h-full">
      <MovieBaseInfo movie={{ imdb_id: movie.imdbId, ...movie }} />
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
