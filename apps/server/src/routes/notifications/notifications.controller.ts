import {
  getNotificationsSchemas,
  getNotificationsSSESchemas,
  getNotificationsStatsSchemas,
  hypertubeLogger,
  notificationReadStatuses,
  notifications,
  NOTIFICATIONS_EVENTS,
  TGetNotificationsSchemas,
  TPatchNotificationSchemas,
  TPatchNotificationsSchemas,
} from "@hypertube/libs";
import {
  EventsSubscriber,
  generateNotification,
  prisma,
} from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import i18next from "i18next";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getNotifications = async (
  c: Context<
    TIsLogged & TSearchParamsParser<TGetNotificationsSchemas["searchParams"]>
  >
) => {
  const { page, pageSize, readStatus } = c.get("validatedSearchParams");
  const { id } = c.get("user");

  const readStatusFilter =
    readStatus === notificationReadStatuses.ALL
      ? undefined
      : { read: readStatus === notificationReadStatuses.READ };

  const whereClause = { userId: id, ...readStatusFilter };

  const notifications = (
    await prisma.notification.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    })
  ).map((notification) => ({
    ...notification,
    // @ts-expect-error - i18next is not typed
    title: i18next.t(notification.title),
    // @ts-expect-error - i18next is not typed
    message: i18next.t(notification.message),
  }));

  const notificationsCount = await prisma.notification.count({
    where: whereClause,
  });

  return c.json(
    getNotificationsSchemas.response.parse({
      notifications,
      page,
      totalPages: Math.ceil(notificationsCount / pageSize),
    })
  );
};

export const patchNotifications = async (
  c: Context<
    TIsLogged & TBodyParser<TPatchNotificationsSchemas["requirements"]>
  >
) => {
  const { read } = c.get("validatedBody");
  const { id } = c.get("user");

  await prisma.notification.updateMany({
    where: { userId: id, read: false },
    data: { read },
  });

  return c.json({ message: "Notifications updated successfully" }, 200);
};

export const getNotificationsSSE = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  hypertubeLogger.info(`[${id}] notifications SSE started`);

  return streamSSE(c, async (stream) => {
    const eventsSubscriber = new EventsSubscriber(
      { event: "notification", userId: id },
      async (data) => {
        await stream.writeSSE({
          event: NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
          data: JSON.stringify(
            getNotificationsSSESchemas.response.parse({
              // @ts-expect-error i18next is not typed
              title: i18next.t(data.title),
              // @ts-expect-error i18next is not typed
              message: i18next.t(data.message),
            })
          ),
        });
      }
    );

    stream.onAbort(() => {
      eventsSubscriber.destroy();
      hypertubeLogger.info(`[${id}] notifications SSE aborted`);
    });

    while (true) {
      await stream.sleep(60000);
    }
  });
};

export const getNotificationsStats = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  const totalUnreadNotifications = await prisma.notification.count({
    where: { userId: id, read: false },
  });
  return c.json(
    getNotificationsStatsSchemas.response.parse({ totalUnreadNotifications })
  );
};

export const patchNotification = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPatchNotificationSchemas["urlParams"]> &
      TBodyParser<TPatchNotificationSchemas["requirements"]>
  >
) => {
  const { notificationId } = c.get("validatedUrlParams");
  const { read } = c.get("validatedBody");
  const { id } = c.get("user");

  await prisma.notification.update({
    where: { id: notificationId, userId: id },
    data: { read },
  });
  return c.json({ message: "Notification updated successfully" }, 200);
};

export const postSendTestNotification = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  await generateNotification(id, notifications.TEST);

  return c.json({ message: "Test notification sent successfully" }, 200);
};
