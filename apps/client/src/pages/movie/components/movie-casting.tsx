import { ErrorResource } from "@/components/ErrorResource";
import { ImageContainer } from "@/components/images/ImageContainer";
import { LoadingResource } from "@/components/LoadingResource";
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
import { useTranslation } from "react-i18next";

const PersonCard: React.FC<{
  profile_path: string | null;
  name: string;
  alias: string;
}> = ({ profile_path, name, alias }) => {
  return (
    <Card className="flex justify-center items-center gap-2 p-2 w-28 md:w-48 lg:w-24 xl:w-32">
      <ImageContainer imageSrc={profile_path} altImage={name} size="sm" />
      <Typography className="text-center" textSize={"sm"}>
        {name}
      </Typography>
      <Typography className="text-center" textSize={"sm"} textColor={"muted"}>
        {alias}
      </Typography>
    </Card>
  );
};

export const Casting: React.FC<{
  tmdbId: TTmdbMovieSchema["id"];
}> = ({ tmdbId }) => {
  const { t } = useTranslation();
  const {
    data: casting,
    isLoading,
    isError,
  } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_CASTING, { tmdbId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES_CASTING, { tmdbId }),
        schemas: getMovieCastingSchema,
      }),
  });

  if (isLoading) return <LoadingResource resource="casting" />;
  if (isError || !casting) return <ErrorResource resource="casting" />;

  return (
    <div className="flex flex-col items-center gap-2 m-2">
      <Typography variant="h2">{t("casting.casting")}</Typography>
      <div className="grid grid-cols-3 gap-2">
        {casting.cast.map((person, i) => (
          <PersonCard
            key={i}
            profile_path={person.profile_path}
            name={person.name}
            alias={person.character}
          />
        ))}
      </div>
      <Typography variant="h2">{t("casting.crew")}</Typography>
      <div className="grid grid-cols-3 gap-2">
        {casting.crew.map((person, i) => (
          <PersonCard
            key={i}
            profile_path={person.profile_path}
            name={person.name}
            alias={person.job}
          />
        ))}
      </div>
    </div>
  );
};
