import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn, getNearDateWithLocale } from "@/lib/utils";
import type { TNotificationSchema } from "@hypertube/libs";
import { getUrl, patchNotificationsSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Notification: React.FC<{ notification: TNotificationSchema }> = ({
  notification,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: markNotificationAsRead } = useMutation({
    mutationFn: async () => {
      await axiosFetch({
        method: "PATCH",
        url: getUrl("api-notifications", { notificationId: notification.id }),
        schemas: patchNotificationsSchemas,
        data: {
          read: true,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      toast.success(t("notifications.markedAsRead"));
    },
  });

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4 gap-2 group hover:shadow-xl transition-all duration-150",
        {
          "bg-muted": notification.read,
        }
      )}
    >
      {!notification.read && (
        <div className="absolute left-0 top-0 w-2 h-full bg-secondary" />
      )}
      <div className="flex flex-row gap-2">
        <CheckCircle />
        <div className="flex flex-row justify-between w-full gap-2">
          <div className="flex flex-col gap-2">
            <Typography>{notification.title}</Typography>
            <Typography>{notification.message}</Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="muted" className="text-xs">
              {getNearDateWithLocale({ date: notification.createdAt })}
            </Typography>
            {!notification.read && (
              <Button
                variant="outline"
                className="group-hover:opacity-100 opacity-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markNotificationAsRead();
                }}
              >
                <CheckCheck />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
