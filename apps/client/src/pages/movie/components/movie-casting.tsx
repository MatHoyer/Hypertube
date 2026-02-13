import { ErrorResource } from "@/components/ErrorResource";
import { ExpandableList } from "@/components/ExpandableList";
import { ImageContainer } from "@/components/images/ImageContainer";
import { LoadingResource } from "@/components/LoadingResource";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  isActor?: boolean;
}> = ({ profile_path, name, alias, isActor }) => {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-row items-center gap-2 p-2">
      <ImageContainer imageSrc={profile_path} altImage={name} size="sm" />
      <div className="flex-1">
        <Typography textSize="xl" className="line-clamp-2">
          {name}
        </Typography>
        <Typography functionnal="wrap">
          {isActor && (
            <Typography variant="span" textSize="sm" textColor="muted">
              {t("casting.inRoleOf")}{" "}
            </Typography>
          )}
          <Typography variant="span" textSize="sm">
            {alias}
          </Typography>
        </Typography>
      </div>
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
    <div className="flex flex-col gap-8 m-2">
      <div className="flex flex-col text-center">
        <Typography variant="h1">{t("casting.cast&Crew")}</Typography>
        <Typography textColor="muted">{t("casting.description")}</Typography>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <Typography variant="h2">{t("casting.casting")}</Typography>
          <Separator className="flex-1" />
          <Typography textColor="muted">
            {t("casting.actors", { count: casting.cast.length })}
          </Typography>
        </div>
        <ExpandableList
          list={casting.cast}
          renderChild={(person) => {
            return (
              <PersonCard
                profile_path={person.profile_path}
                name={person.name}
                alias={person.character}
                isActor
              />
            );
          }}
          getKey={(person) => person.cast_id}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <Typography variant="h2">{t("casting.crew")}</Typography>
          <Separator className="flex-1" />
          <Typography textColor="muted">
            {t("casting.crews", { count: casting.crew.length })}
          </Typography>
        </div>
        <ExpandableList
          list={casting.crew}
          renderChild={(person) => {
            return (
              <PersonCard
                profile_path={person.profile_path}
                name={person.name}
                alias={person.job}
              />
            );
          }}
          getKey={(person) => person.credit_id}
        />
      </div>
    </div>
  );
};
