import { ImageAvatar } from "@/components/images/Avatar";
import { ImageContainer } from "@/components/images/ImageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  getUrl,
  ytsGenres,
  type TMovieActorSchema,
  type TMovieSchema,
} from "@hypertube/libs";
import { ArrowRightIcon, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MovieInfo: React.FC<{
  movie: TMovieSchema & { actors: TMovieActorSchema[] };
}> = ({
  movie: {
    imdbId,
    largeCoverImageUrl,
    title,
    year,
    description,
    rating,
    language,
    actors,
    genres,
  },
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <ScrollArea className={cn("h-[calc(100vh)]", isMobile && "h-full")}>
      <div className="flex flex-col gap-4 h-full p-4">
        <div className="flex justify-center gap-2">
          <ImageContainer
            imageSrc={largeCoverImageUrl}
            altImage="Movie Poster"
            size="lg"
          >
            <Typography variant="h3">{title}</Typography>
          </ImageContainer>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to={getUrl("external-imdb-movie", {
              imdbId,
            })}
            target="_blank"
          >
            <Typography variant="h1" className="text-center hover:underline">
              {title}
            </Typography>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <Badge>{language.toUpperCase()}</Badge>
            <Badge>{year}</Badge>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {genres.map((genre, index) => (
              <Badge variant="outline" key={index}>
                {t(
                  `movie.genres.${
                    genre.toLowerCase() as (typeof ytsGenres)[number]
                  }`
                )}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Star className="text-primary fill-primary" />
            <Typography variant="mono">{rating}/10</Typography>
          </div>
          <Typography variant="muted">{description}</Typography>
        </div>
        <Card className="p-4">
          <CardTitle>{t("movie.cast")}</CardTitle>
          <CardContent>
            <div className="flex flex-col gap-2">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default MovieInfo;
