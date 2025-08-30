import { ImageAvatar } from "@/components/images/Avatar";
import { ImageContainer } from "@/components/images/ImageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { getUrl } from "@hypertube/libs";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const MovieInfo: React.FC<{
  poster: string;
  title: string;
  year: number;
  description: string;
  cast: {
    name: string;
    imageSrc: string;
    imdbId: string;
  }[];
}> = ({ poster, title, year, description, cast }) => {
  return (
    <ScrollArea className="h-[calc(100vh)]">
      <div className="flex flex-col gap-4 h-full p-4">
        <div className="flex justify-center gap-2">
          <ImageContainer imageSrc={poster} altImage="Movie Poster" size="lg">
            <Typography variant="h3">{title}</Typography>
          </ImageContainer>
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="h1" className="text-center">
            {title}
          </Typography>
          <div className="flex items-center justify-center">
            <Typography variant="code">{year}</Typography>
          </div>
          <Typography variant="muted">{description}</Typography>
        </div>
        <Card className="p-4">
          <CardTitle>Cast</CardTitle>
          <CardContent>
            <div className="flex flex-col gap-2">
              {cast.map((person, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <ImageAvatar
                        name={person.name}
                        imageSrc={person.imageSrc}
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
                  {index !== cast.length - 1 && <Separator />}
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
