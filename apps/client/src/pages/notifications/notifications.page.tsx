import { UniqueFilter } from "@/components/animated/uniqueFilter";
import { AppLoader } from "@/components/ui/app-loader";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { Typography } from "@/components/ui/typography";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import {
  getNotificationsSchemas,
  getUrl,
  notificationReadStatuses,
} from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronUpCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Notification } from "./components/notification";

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] =
    useState<boolean>(false);
  const [readStatus, setReadStatus] = useState<string>(
    notificationReadStatuses.UNREAD
  );

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
      <LayoutHeader>
        <div ref={topRef} />
        <LayoutTitle>{t("notifications.title")}</LayoutTitle>
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
            <div className="flex justify-center">
              <Typography variant="muted">
                {t("notifications.noNotifications")}
              </Typography>
            </div>
          )}
        </div>
        <div className="flex justify-center" ref={bottomRef}>
          {isFetchingNextPage ? <AppLoader /> : null}
        </div>
      </LayoutContent>
    </Layout>
  );
};
