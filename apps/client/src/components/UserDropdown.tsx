import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNotificationsStats } from "@/hooks/use-notifications-stats";
import { playBeep } from "@/lib/audio";
import { LOCAL_STORAGE_KEYS } from "@/lib/const";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { NotificationBell } from "@/pages/notifications/components/notification-bell";
import {
  getNotificationsSSESchemas,
  getUrl,
  NOTIFICATIONS_EVENTS,
  signOutAuthentificationSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File, LogOut, Settings, User } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { UserImageAvatar } from "./images/Avatar";

export const UserDropdown = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [mutedNotifications, _] = useLocalStorage<boolean>(
    LOCAL_STORAGE_KEYS.NOTIFICATIONS_MUTE,
    false
  );

  const { isUnreadNotifications } = useNotificationsStats();

  const signOutMutation = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-authentification-signout"),
        schemas: signOutAuthentificationSchemas,
      }),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["session"] });
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  useEffect(() => {
    const eventSource = new EventSource(getUrl("sse-notifications"));
    eventSource.onopen = () => {
      console.log("notifications SSE opened");
    };
    eventSource.onerror = (event: Event) => {
      console.error("notifications SSE error", event);
    };

    const handleNotification = (event: MessageEvent<string>) => {
      const { success, data } = getNotificationsSSESchemas.response.safeParse(
        JSON.parse(event.data)
      );
      if (!success) {
        console.error("invalid notification data", event.data);
        return;
      }
      console.log("new notification:", data);
      toast.info(data.title);
      if (!mutedNotifications) {
        playBeep();
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    eventSource.addEventListener(
      NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
      handleNotification
    );

    return () => {
      eventSource.close();
      eventSource.removeEventListener(
        NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
        handleNotification
      );
    };
  }, [queryClient, mutedNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="relative w-60">
        <Button variant="ghost" className="rounded-full size-fit p-0">
          <UserImageAvatar />
          {isUnreadNotifications && (
            <div className="absolute bg-red-500 rounded-full size-3 -top-0.5 -right-0.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{t("navbar.account")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={"#"}>
              <User /> {t("navbar.profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={getUrl("client-notifications")}>
              <NotificationBell /> {t("navbar.notifications")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={getUrl("client-settings")}>
              <Settings /> {t("navbar.settings")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={getUrl("api-swagger", { mode: "ui", withUrl: "server" })}
            target="_blank"
          >
            <File /> API
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="bg-destructive"
          onClick={() => signOutMutation.mutate()}
        >
          <LogOut />
          {t("sign.out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
