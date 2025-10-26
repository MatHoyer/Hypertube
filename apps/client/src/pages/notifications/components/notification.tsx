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
import { Clock, Eye, EyeClosed } from "lucide-react";

export const Notification: React.FC<{ notification: TNotificationSchema }> = ({
  notification,
}) => {
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
            {notification.read ? <Eye /> : <EyeClosed />}
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
