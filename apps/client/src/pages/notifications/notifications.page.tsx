import { UniqueFilter } from "@/components/animated/uniqueFilter";
import { AppLoader } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNotificationsStats } from "@/hooks/use-notifications-stats";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import {
  getNotificationsSchemas,
  getUrl,
  notificationReadStatuses,
  patchNotificationsSchemas,
} from "@hypertube/libs";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ChevronUpCircleIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Notification } from "./components/notification";
import { NotificationBell } from "./components/notification-bell";
import { NotificationsEmpty } from "./components/notifications-empty";

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] =
    useState<boolean>(false);
  const [readStatus, setReadStatus] = useState<string>(
    notificationReadStatuses.UNREAD
  );
  const queryClient = useQueryClient();
  const [mutedNotifications, setMutedNotifications] = useLocalStorage<boolean>(
    "notifications.mute",
    false
  );

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      await axiosFetch({
        method: "PATCH",
        url: getUrl("api-notifications"),
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
      toast.success(t("notifications.markedAllAsRead"));
    },
  });

  const { stats, isUnreadNotifications } = useNotificationsStats();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications", readStatus],
      queryFn: ({ pageParam }) => {
        return axiosFetch({
          method: "GET",
          url: getUrl("api-notifications", {
            searchParams: { readStatus, page: `${pageParam}` },
          }),
          schemas: getNotificationsSchemas,
        });
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.totalPages > lastPage.page
          ? lastPage.page + 1
          : undefined;
      },
      getPreviousPageParam: (lastPage) => {
        return lastPage.page > 1 ? lastPage.page - 1 : undefined;
      },
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 1000px 0px",
        threshold: 0,
      }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [bottomRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const headerEntry = entries[0];
        setShowScrollToTopButton(!headerEntry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => observer.disconnect();
  }, [topRef]);

  return (
    <Layout>
      <FloatingBar>
        <UniqueFilter
          value={readStatus}
          onChange={(value) => {
            topRef.current?.scrollIntoView({ behavior: "instant" });
            setReadStatus(value);
          }}
          values={{
            [notificationReadStatuses.UNREAD]: t(
              "notifications.readStatus.unread"
            ),
            [notificationReadStatuses.READ]: t("notifications.readStatus.read"),
            [notificationReadStatuses.ALL]: t("notifications.readStatus.all"),
          }}
        />
      </FloatingBar>
      <div
        className={cn(
          "fixed bottom-4 right-4 z-10 cursor-pointer transition-all duration-150 ease-in-out bg-background rounded-full",
          {
            "opacity-0": !showScrollToTopButton,
          }
        )}
        onClick={() => {
          topRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <ChevronUpCircleIcon size={50} />
      </div>
      <LayoutHeader className="mb-6">
        <div ref={topRef} />
        <div className="flex items-center gap-2">
          <NotificationBell size="lg" />
          <div className="flex flex-col gap-2">
            <LayoutTitle className="flex items-center gap-2">
              {t("notifications.title")}
            </LayoutTitle>
            <LayoutDescription>
              {stats?.totalUnreadNotifications ?? 0}{" "}
              {t("notifications.unreadNotifications")}
            </LayoutDescription>
          </div>
        </div>
        <LayoutActions className="flex items-center gap-2">
          <Button
            onClick={() => markAllAsRead()}
            disabled={!isUnreadNotifications}
            className={cn(
              readStatus !== notificationReadStatuses.UNREAD && "invisible"
            )}
          >
            {t("notifications.markAllAsRead")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setMutedNotifications((prev) => !prev)}
          >
            {mutedNotifications ? <VolumeOffIcon /> : <Volume2Icon />}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <div className="flex flex-col gap-4">
          {data?.pages[0]?.notifications?.length ? (
            data?.pages.map((page) => (
              <div key={page.page} className="flex flex-col gap-4">
                {page.notifications.map((notification) => {
                  return notification.resourceUrl ? (
                    <Link to={notification.resourceUrl} key={notification.id}>
                      <Notification notification={notification} />
                    </Link>
                  ) : (
                    <Notification
                      key={notification.id}
                      notification={notification}
                    />
                  );
                })}
              </div>
            ))
          ) : (
            <NotificationsEmpty />
          )}
        </div>
        <div className="flex justify-center" ref={bottomRef}>
          {isFetchingNextPage ? <AppLoader /> : null}
        </div>
      </LayoutContent>
    </Layout>
  );
};
