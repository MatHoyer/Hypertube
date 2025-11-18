import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  API_ROUTES,
  getNotificationsStatsSchemas,
  getUrl,
} from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useNotificationsStats = () => {
  const { data: stats } = useQuery({
    queryKey: getQueryKey(API_ROUTES.API_NOTIFICATIONS, { type: "stats" }),
    queryFn: async () => {
      return axiosFetch({
        method: "GET",
        url: getUrl("api-notifications-stats"),
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
