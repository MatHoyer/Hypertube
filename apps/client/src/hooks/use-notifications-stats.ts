import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getNotificationsStatsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useNotificationsStats = () => {
  const { data: stats } = useQuery({
    queryKey: getQueryKey(ROUTES.API.NOTIFICATIONS, { type: "stats" }),
    queryFn: async () => {
      return axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.NOTIFICATIONS_STATS),
        schemas: getNotificationsStatsSchemas,
      });
    },
  });

  const isUnreadNotifications = useMemo(() => {
    return (stats?.totalUnreadNotifications ?? 0) > 0;
  }, [stats?.totalUnreadNotifications]);

  return {
    stats,
    isUnreadNotifications,
  };
};
