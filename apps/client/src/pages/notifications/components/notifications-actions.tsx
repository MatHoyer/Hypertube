import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/const";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  getUrl,
  notificationReadStatuses,
  patchNotificationsSchemas,
  postSendTestNotificationSchemas,
  ROUTES,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const NotificationsActions: React.FC<{
  readStatus: string;
  isUnreadNotifications: boolean;
}> = ({ readStatus, isUnreadNotifications }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [mutedNotifications, setMutedNotifications] = useLocalStorage<boolean>(
    LOCAL_STORAGE_KEYS.NOTIFICATIONS_MUTE,
    false
  );

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      await axiosFetch({
        method: "PATCH",
        url: getUrl(ROUTES.API.NOTIFICATIONS),
        schemas: patchNotificationsSchemas,
        data: {
          read: true,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.NOTIFICATIONS),
      });
      toast.success(t("notifications.markedAllAsRead"));
    },
  });

  const { mutate: sendTestNotification } = useMutation({
    mutationFn: async () => {
      await axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.NOTIFICATIONS_TEST),
        schemas: postSendTestNotificationSchemas,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.NOTIFICATIONS),
      });
    },
  });

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setMutedNotifications((prev) => !prev)}
        >
          {mutedNotifications ? <VolumeOffIcon /> : <Volume2Icon />}
        </Button>
        <Button
          onClick={() => markAllAsRead()}
          disabled={!isUnreadNotifications}
          className={cn(
            readStatus === notificationReadStatuses.READ && "hidden"
          )}
        >
          {t("notifications.markAllAsRead")}
        </Button>
      </div>
      <div className="flex items-center">
        <Button variant="outline" onClick={() => sendTestNotification()}>
          {t("notifications.sendTestNotification")}
        </Button>
      </div>
    </div>
  );
};
