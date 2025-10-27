import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn, getNearDateWithLocale } from "@/lib/utils";
import type { TNotificationSchema } from "@hypertube/libs";
import { CheckCheck, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Notification: React.FC<{ notification: TNotificationSchema }> = ({
  notification,
}) => {
  const { t } = useTranslation();

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
            {/* @ts-expect-error - notification.title is a string */}
            <Typography>{t(notification.title)}</Typography>
            {/* @ts-expect-error - notification.message is a string */}
            <Typography>{t(notification.message)}</Typography>
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
                  e.stopPropagation();
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
