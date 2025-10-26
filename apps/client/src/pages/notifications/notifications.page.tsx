import { AppLoader } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
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
  type NotificationReadStatus,
} from "@hypertube/libs";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Notification } from "./components/notification";

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [readStatus, setReadStatus] =
    useState<NotificationReadStatus>("unread");
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications"],
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
        console.log(target.isIntersecting, hasNextPage, isFetchingNextPage);
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

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>{t("notifications.title")}</LayoutTitle>
        <LayoutDescription>{t("notifications.description")}</LayoutDescription>
        <LayoutActions>
          <Button
            onClick={async () => {
              setReadStatus(notificationReadStatuses.UNREAD);
              queryClient.refetchQueries({
                queryKey: ["notifications"],
              });
            }}
          >
            <Eye />
          </Button>
          <Button
            onClick={async () => {
              setReadStatus(notificationReadStatuses.READ);
              queryClient.refetchQueries({
                queryKey: ["notifications"],
              });
            }}
          >
            <EyeClosed />
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
