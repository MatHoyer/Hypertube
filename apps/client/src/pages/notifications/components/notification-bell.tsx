import { useNotificationsStats } from "@/hooks/use-notifications-stats";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import type React from "react";

export const NotificationBell: React.FC<{ size?: 20 | 42 }> = ({
  size = 20,
}) => {
  const { isUnreadNotifications } = useNotificationsStats();

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
            size === 20 ? "size-2" : "size-4",
            size === 20 ? "-top-0.5 -right-0.5" : "top-0 right-0"
          )}
        />
      )}
    </div>
  );
};
