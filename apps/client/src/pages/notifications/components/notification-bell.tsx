import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import { getNotificationsStatsSchemas, getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import type React from "react";
import { useMemo } from "react";

export const NotificationBell: React.FC<{ size?: 20 | 42 }> = ({
  size = 20,
}) => {
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
    return stats?.totalUnreadNotifications ?? 0 > 0;
  }, [stats?.totalUnreadNotifications]);

  return (
    <div className="relative">
      <Bell
        size={size}
        fill={isUnreadNotifications ? "currentColor" : "none"}
      />
      {!!isUnreadNotifications && (
        <div
          className={cn(
            "absolute bg-red-500 rounded-full",
            size === 20 ? "size-2" : "size-6",
            size === 20 ? "-top-0.5 -right-0.5" : "-top-1 -right-1"
          )}
        />
      )}
    </div>
  );
};
