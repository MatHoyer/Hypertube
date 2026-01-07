import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { InfiniteVirtualizer } from "@/components/InfiniteVirtualizer";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { Button } from "@/components/ui/button";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { UniqueFilter } from "@/components/UniqueFilter";
import { useNotificationsStats } from "@/hooks/use-notifications-stats";
import { useMainScrollElement } from "@/layouts/BaseLayout";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getNotificationsSchemas,
  getUrl,
  notificationReadStatuses,
  ROUTES,
  typedValues,
  type NotificationReadStatus,
} from "@hypertube/libs";
import { ChevronUp } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Notification } from "./components/notification";
import { NotificationsActions } from "./components/notifications-actions";
import { NotificationsEmpty } from "./components/notifications-empty";

const fetchNotifications = async ({
  pageParam,
  readStatus,
}: {
  pageParam: number;
  readStatus: NotificationReadStatus;
}) => {
  const res = await axiosFetch({
    method: "GET",
    url: getUrl(ROUTES.API.NOTIFICATIONS, {
      searchParams: { readStatus, page: pageParam },
    }),
    schemas: getNotificationsSchemas,
  });
  return { data: res.notifications, ...res };
};

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const topRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] =
    useState<boolean>(false);
  const [readStatus, setReadStatus] = useQueryState<NotificationReadStatus>(
    "readStatus",
    parseAsStringLiteral(typedValues(notificationReadStatuses)).withDefault(
      notificationReadStatuses.UNREAD
    )
  );
  const { scrollTo } = useScrollArea();

  const { stats, isUnreadNotifications } = useNotificationsStats();

  const mainScrollElement = useMainScrollElement();

  const queryFn = ({ pageParam }: { pageParam: number }) =>
    fetchNotifications({ pageParam, readStatus });

  const queryKey = getQueryKey(ROUTES.API.NOTIFICATIONS, {
    type: readStatus,
  });

  const virtualizerOptions = {
    getScrollElement: () => mainScrollElement,
    estimateSize: () => 90,
    gap: 16,
    overscan: 5,
  };

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
            layoutId="notifications-read-status"
            value={readStatus}
            onChange={(value) => {
              scrollTo({ top: 0, behavior: "instant" });
              setReadStatus(value as NotificationReadStatus);
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
          className="absolute overflow-hidden flex items-center inset-0 pointer-events-none"
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
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="ml-2 pointer-events-auto"
            >
              <ChevronUp size={20} />
            </Button>
          </AnimateApparition>
        </div>
      </FloatingBar>
      <LayoutHeader>
        <div ref={topRef} />
        <LayoutHeaderResource
          resource="notifications"
          count={stats?.totalUnreadNotifications ?? 0}
        />
        <LayoutActions className="w-full">
          <NotificationsActions
            readStatus={readStatus}
            isUnreadNotifications={isUnreadNotifications}
          />
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <InfiniteVirtualizer
          className="flex flex-col w-full gap-4"
          queryFn={queryFn}
          queryKey={queryKey}
          virtualizerOptions={virtualizerOptions}
          renderChild={(notification) =>
            notification.resourceUrl ? (
              <Link to={notification.resourceUrl}>
                <Notification notification={notification} />
              </Link>
            ) : (
              <Notification notification={notification} />
            )
          }
          emptyChild={<NotificationsEmpty />}
          resourceTypes="notifications"
        />
      </LayoutContent>
    </Layout>
  );
};
