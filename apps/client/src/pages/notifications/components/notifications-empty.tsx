import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NotificationsEmpty = () => {
  const { t } = useTranslation();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bell />
        </EmptyMedia>
        <EmptyTitle>{t("notifications.noNotifications")}</EmptyTitle>
        <EmptyDescription>
          {t("notifications.noNotificationsDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
