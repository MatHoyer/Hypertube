import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { UniqueFilter } from "@/components/animated/UniqueFilter";
import { AppLoader } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import { FloatingBar } from "@/components/ui/FloatingBar";
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
import {
  getNotificationsSchemas,
  getUrl,
  notificationReadStatuses,
} from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Notification } from "./components/notification";
import { NotificationBell } from "./components/notification-bell";
import { NotificationsActions } from "./components/notifications-actions";
import { NotificationsEmpty } from "./components/notifications-empty";

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] =
    useState<boolean>(false);
  const [readStatus, setReadStatus] = useState<string>(
    notificationReadStatuses.UNREAD
  );

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
        <div ref={filterRef}>
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
              [notificationReadStatuses.READ]: t(
                "notifications.readStatus.read"
              ),
              [notificationReadStatuses.ALL]: t("notifications.readStatus.all"),
            }}
          />
        </div>
        <div
          className="absolute overflow-hidden flex items-center inset-0"
          style={{
            left: `${
              (filterRef.current?.getBoundingClientRect()?.left ?? 0) +
              (filterRef.current?.getBoundingClientRect()?.width ?? 0)
            }px`,
          }}
        >
          <AnimateApparition
            animation="slideToRight"
            isAnimating={showScrollToTopButton}
          >
            <Button
              onClick={() => {
                topRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="ml-2"
            >
              <ChevronUp size={20} />
            </Button>
          </AnimateApparition>
        </div>
      </FloatingBar>
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
        <LayoutActions className="w-full">
          <NotificationsActions
            readStatus={readStatus}
            isUnreadNotifications={isUnreadNotifications}
          />
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
