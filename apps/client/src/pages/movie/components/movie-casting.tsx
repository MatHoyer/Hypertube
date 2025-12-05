import { ErrorPage } from "@/components/ErrorPage";
import { ImageContainer } from "@/components/images/ImageContainer";
import { LoadingPage } from "@/components/LoadingPage";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMovieCastingSchema,
  getUrl,
  ROUTES,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

export const Casting: React.FC<{
  tmdbId: TTmdbMovieSchema["id"];
}> = ({ tmdbId }) => {
  const {
    data: casting,
    isLoading,
    isError,
  } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES_CASTING, { tmdbId }),
        schemas: getMovieCastingSchema,
      }),
  });

  if (isLoading) return <LoadingPage resource="global" />;
  if (isError || !casting) return <ErrorPage resource="global" />;

  return (
    <div className="flex flex-col items-center gap-2">
      <Typography variant="h2">Casting</Typography>
      <div className="grid grid-cols-5 gap-2">
        {casting.cast.map((person, i) => (
          <Card key={i} className="flex justify-center items-center gap-2 p-0">
            <ImageContainer
              imageSrc={person.profile_path}
              altImage={person.name}
              size="sm"
            />
            <Typography textSize={"sm"}>{person.name}</Typography>
            <Typography textSize={"sm"} textColor={"muted"}>
              {person.character}
            </Typography>
          </Card>
        ))}
      </div>
      <Typography variant="h2">Crew</Typography>
      <div className="grid grid-cols-5 gap-2">
        {casting.crew.map((person, i) => (
          <Card key={i} className="flex justify-center items-center gap-2 p-0">
            <ImageContainer
              imageSrc={person.profile_path}
              altImage={person.name}
              size="sm"
            />
            <Typography textSize={"sm"}>{person.name}</Typography>
            <Typography textSize={"sm"} textColor={"muted"}>
              {person.job}
            </Typography>
          </Card>
        ))}
      </div>
    </div>
  );
};
