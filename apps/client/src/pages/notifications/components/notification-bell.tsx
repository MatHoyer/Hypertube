import { useNotificationsStats } from "@/hooks/use-notifications-stats";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import type React from "react";

export const NotificationBell: React.FC<{ size?: "sm" | "lg" }> = ({
  size = "sm",
}) => {
  const { isUnreadNotifications } = useNotificationsStats();

  return (
    <div className="relative">
      <Bell
        size={size === "sm" ? 20 : 60}
        fill={isUnreadNotifications ? "currentColor" : "none"}
      />
      {!!isUnreadNotifications && (
        <div
          className={cn("absolute bg-red-500 rounded-full", {
            "size-2 -top-0.5 -right-0.5": size === "sm",
            "size-6 top-0 right-1": size === "lg",
          })}
        />
      )}
    </div>
  );
};
