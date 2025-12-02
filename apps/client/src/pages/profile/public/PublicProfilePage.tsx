import { ErrorPage } from "@/components/ErrorPage";
import { LoadingPage } from "@/components/LoadingPage";
import { getProfileStatIcon } from "@/components/profile-stats/getProfileStatsIcon";
import { StatBackgroundColors } from "@/components/profile-stats/profile-stats.colors";
import { useConvertParams } from "@/hooks/use-convert-params";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getUrl, getUserSchemas, ROUTES, StatTypes } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { StatCard } from "./components/stat-card";
import { UserProfile } from "./components/user-profile";
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

  if (isLoading) return <LoadingPage resource="profile" />;
  if (isError || !data) return <ErrorPage resource="profile" />;

  return (
    <Layout>
      <LayoutContent className="flex flex-col gap-4">
        <UserProfile
          imageSrc={data.user.image ?? ""}
          name={data.user.name}
          firstName={data.user.firstName ?? ""}
          lastName={data.user.lastName ?? ""}
          createdAt={data.user.createdAt}
        />
        <div className="flex gap-4 w-full justify-center">
          <StatCard
            color={StatBackgroundColors[StatTypes.LIKES]}
            icon={getProfileStatIcon(StatTypes.LIKES)}
            count={data.stats.totalLikes}
            label={t("profile.likes")}
          />
          <StatCard
            color={StatBackgroundColors[StatTypes.COMMENTS]}
            icon={getProfileStatIcon(StatTypes.COMMENTS)}
            count={data.stats.totalComments}
            label={t("profile.leftComments")}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
};
