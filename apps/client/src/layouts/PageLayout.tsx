import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/pages/notifications/components/notification-bell";
import { History, ListVideo } from "lucide-react";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";
import { useTranslation } from "react-i18next";

export const Layout: React.FC<
  ComponentPropsWithoutRef<"div"> & { size?: "sm" | "default" | "lg" }
> = ({ size, className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "max-w-4xl flex-wrap w-full flex gap-4 m-auto p-4",
        {
          "max-w-7xl": size === "lg",
          "max-w-3xl": size === "sm",
        },
        className
      )}
    />
  );
};

export const LayoutHeader: React.FC<ComponentPropsWithoutRef<"div">> = (
  props
) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-start gap-2 flex-col w-full md:flex-1 min-w-[200px] mb-6",
        props.className
      )}
    />
  );
};

export const LayoutTitle: React.FC<ComponentPropsWithoutRef<"h1">> = (
  props
) => {
  return <Typography {...props} variant="h1" className={cn(props.className)} />;
};

export const LayoutDescription: React.FC<ComponentPropsWithoutRef<"p">> = (
  props
) => {
  return <Typography {...props} className={cn(props.className)} />;
};

export const LayoutActions: React.FC<ComponentPropsWithoutRef<"div">> = (
  props
) => {
  return (
    <div {...props} className={cn("flex items-center", props.className)} />
  );
};

export const LayoutContent: React.FC<ComponentPropsWithoutRef<"div">> = (
  props
) => {
  return <div {...props} className={cn("w-full", props.className)} />;
};

const titleResources = [
  "notifications",
  "historic",
  "playlists",
  "playlist",
] as const;

const iconByTitleResources = {
  notifications: <NotificationBell size="lg" />,
  historic: <History size={60} />,
  playlists: <ListVideo size={60} />,
  playlist: <ListVideo size={60} />,
} as const;

export const LayoutTitleResource: React.FC<
  ComponentProps<"div"> & {
    resource: (typeof titleResources)[number];
    count: number;
    dynamicTitle?: string;
  }
> = ({ resource, count, dynamicTitle, className, ...props }) => {
  const { t } = useTranslation();

  if (!titleResources.includes(resource)) return null;

  return (
    <div {...props} className={cn("flex items-center gap-2", className)}>
      {iconByTitleResources[resource]}
      <div className="flex flex-col gap-2">
        <LayoutTitle className="flex items-center gap-2">
          {dynamicTitle ? dynamicTitle : t(`${resource}.title`)}
        </LayoutTitle>
        <LayoutDescription>
          {count} {t(`${resource}.descriptionResource`)}
        </LayoutDescription>
      </div>
    </div>
  );
};
