import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn, getDateAsStringWithLocale } from "@/lib/utils";
import type { TNotificationSchema } from "@hypertube/libs";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Notification: React.FC<{ notification: TNotificationSchema }> = ({
  notification,
}) => {
  const { t } = useTranslation();

  return (
    <Card className={cn(notification.read ? "bg-muted" : "")}>
      <CardHeader>
        <CardTitle>{notification.title}</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {notification.read
              ? t("notifications.markAsUnread")
              : t("notifications.markAsRead")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Typography>{notification.message}</Typography>
      </CardContent>
      <CardFooter>
        <Typography variant="muted" className="flex items-center gap-2">
          <Clock size={16} />
          {getDateAsStringWithLocale({
            date: notification.createdAt,
            type: "FULL",
          })}
        </Typography>
      </CardFooter>
    </Card>
  );
};
