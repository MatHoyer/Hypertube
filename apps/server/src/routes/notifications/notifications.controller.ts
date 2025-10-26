import {
  getNotificationsSchemas,
  hypertubeLogger,
  notificationReadStatuses,
  TGetNotificationsSchemas,
} from "@hypertube/libs";
import { EventsSubscriber, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";

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

  const notifications = await prisma.notification.findMany({
    where: { userId: id, ...readStatusFilter },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  const notificationsCount = await prisma.notification.count({
    where: { userId: id, ...readStatusFilter },
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
    const eventsSubscriber = new EventsSubscriber(
      { event: "notification", userId: "1" },
      async (data) => {
        await stream.write(JSON.stringify(data));
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
