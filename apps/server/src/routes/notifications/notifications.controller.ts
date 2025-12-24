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
  EventsAsyncIterator,
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
      pageSize,
      total: notificationsCount,
      totalPages: Math.ceil(notificationsCount / pageSize),
    }),
    200
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
    where: { userId: id, read: !read },
    data: { read },
  });

  return c.json({ message: "Notifications updated successfully" }, 200);
};

export const getNotificationsSSE = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  hypertubeLogger.info(`[${id}] notifications SSE started`);

  return streamSSE(c, async (stream) => {
    const eventsAsyncIterator = new EventsAsyncIterator({
      event: "notification",
      userId: id,
    });

    stream.onAbort(() => {
      eventsAsyncIterator.destroy();
      hypertubeLogger.info(`[${id}] notifications SSE aborted`);
    });

    for await (const data of eventsAsyncIterator) {
      if (!data) break;
      await stream.writeSSE({
        event: NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
        data: JSON.stringify(
          getNotificationsSSESchemas.response.parse({
            // @ts-expect-error - i18next is not typed
            title: i18next.t(data.title),
            // @ts-expect-error - i18next is not typed
            message: i18next.t(data.message),
          })
        ),
      });
    }
  });
};

export const getNotificationsStats = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  const notifications = await prisma.notification.groupBy({
    where: { userId: id },
    by: "read",
    _count: true,
  });

  const totalReadNotifications =
    notifications.find((notification) => notification.read)?._count ?? 0;
  const totalUnreadNotifications =
    notifications.find((notification) => !notification.read)?._count ?? 0;

  return c.json(
    getNotificationsStatsSchemas.response.parse({
      totalNotifications: totalReadNotifications + totalUnreadNotifications,
      totalReadNotifications,
      totalUnreadNotifications,
    })
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
