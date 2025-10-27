import {
  getNotificationsSchemas,
  getNotificationsSSESchemas,
  hypertubeLogger,
  notificationReadStatuses,
  TGetNotificationsSchemas,
  TPatchNotificationsSchemas,
} from "@hypertube/libs";
import { EventsSubscriber, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
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

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  const notificationsCount = await prisma.notification.count({
    where: whereClause,
  });

  return c.json(
    getNotificationsSchemas.response.parse({
      notifications,
      page,
      totalPages: Math.ceil(notificationsCount / pageSize),
      totalResults: notifications.length,
    })
  );
};

export const getNotificationsSSE = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  hypertubeLogger.info(`[${id}] notifications SSE started`);

  return streamSSE(c, async (stream) => {
    // Send the total number of unread notifications at connection start
    const totalUnreadNotifications = await prisma.notification.count({
      where: { userId: id, read: false },
    });
    stream.write(
      JSON.stringify(
        getNotificationsSSESchemas.response.parse({
          title: "Notifications",
          message: `You have ${totalUnreadNotifications} unread notifications`,
          totalUnreadNotifications,
        })
      )
    );

    // Subscribe to notifications and send them to the client each time a new notification is created
    const eventsSubscriber = new EventsSubscriber(
      { event: "notification", userId: id },
      async (data) => {
        const totalUnreadNotifications = await prisma.notification.count({
          where: { userId: id, read: false },
        });
        await stream.write(
          JSON.stringify(
            getNotificationsSSESchemas.response.parse({
              title: data.title,
              message: data.message,
              totalUnreadNotifications,
            })
          )
        );
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

export const patchNotification = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPatchNotificationsSchemas["urlParams"]> &
      TBodyParser<TPatchNotificationsSchemas["requirements"]>
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
