import { LayoutDescription, LayoutTitle } from "@/layouts/PageLayout";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/pages/notifications/components/notification-bell";
import { History, ListVideo } from "lucide-react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

const headerResources = [
  "notifications",
  "historic",
  "playlists",
  "playlist",
] as const;

const iconByHeaderResources = {
  notifications: <NotificationBell size="lg" />,
  historic: <History size={60} />,
  playlists: <ListVideo size={60} />,
  playlist: <ListVideo size={60} />,
} as const;

export const LayoutHeaderResource: React.FC<
  ComponentProps<"div"> & {
    resource: (typeof headerResources)[number];
    count: number;
    dynamicTitle?: string;
  }
> = ({ resource, count, dynamicTitle, className, ...props }) => {
  const { t } = useTranslation();

  if (!headerResources.includes(resource)) return null;

  return (
    <div {...props} className={cn("flex items-center gap-2", className)}>
      {iconByHeaderResources[resource]}
      <div>
        <LayoutTitle>
          {dynamicTitle ? dynamicTitle : t(`${resource}.title`)}
        </LayoutTitle>
        <LayoutDescription>
          {t(`${resource}.descriptionResource`, { count })}
        </LayoutDescription>
      </div>
    </div>
  );
};
