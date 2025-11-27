import { ImageAvatar } from "@/components/images/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getNearDateWithLocale } from "@/lib/utils";
import { getUrl, getUserSchemas, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Calendar, Heart, MessageSquare } from "lucide-react";
import { ProfilePageParamsSchema } from "./schemas/urlParams.schemas";

export const PublicProfilePage = () => {
  const { userId } = useConvertParams(ProfilePageParamsSchema);

  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.USERS, { userId: userId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.USERS, { userId }),
        schemas: getUserSchemas,
      }),
  });

  if (isLoading) {
    return (
      <div>
        <Typography>...</Typography>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex">
            {data && (
              <ImageAvatar
                imageSrc={data?.user.image ?? undefined}
                name={data?.user.name ?? undefined}
                size="lg"
              />
            )}
            <div className="flex flex-col justify-between">
              <div>
                <Typography textSize="lg">{data?.user.name}</Typography>
                <div className="flex">
                  <Typography>{data?.user.firstName}</Typography>

                  <Typography className="ml-1">
                    {data?.user.lastName}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="text-muted-foreground" />
                <Typography textColor="muted" textSize="sm">
                  {`${t("profile.joined")} ${
                    data &&
                    getNearDateWithLocale({ date: data?.user.createdAt })
                  }`}
                </Typography>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Card className="border-2 w-1/4">
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-3">
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <Typography textSize="lg">
                      {data?.stats.totalLikes}
                    </Typography>
                    <Typography>{t("profile.likes")}</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 w-1/4">
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <Typography textSize="lg">
                      {data?.stats.totalComments}
                    </Typography>
                    {t("profile.commentsLeft")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
