import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getNotificationsStatsSchemas, getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useNotificationsStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["notifications", "stats"],
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
