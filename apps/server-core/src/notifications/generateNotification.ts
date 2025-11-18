import {
  CLIENT_ROUTES,
  getUrl,
  TMovieSchema,
  TNotification,
  TUserSchema,
} from "@hypertube/libs";
import { prisma } from "../prisma.js";
import { EventsPublisher } from "../redis/EventsPubSub.js";

export const notificationsPayloads: Record<
  TNotification,
  { title: string; message: string }
> = {
  test: {
    title: "notifications.test.title",
    message: "notifications.test.message",
  },
  movieDownloaded: {
    title: "notifications.movieDownloaded.title",
    message: "notifications.movieDownloaded.message",
  },
  movieDownloading: {
    title: "notifications.movieDownloading.title",
    message: "notifications.movieDownloading.message",
  },
};

type TNotificationAddOns = {
  test: undefined;
  movieDownloaded: {
    tmdbId: TMovieSchema["tmdbId"];
  };
  movieDownloading: {
    tmdbId: TMovieSchema["tmdbId"];
  };
};

type TNotificationAddOnsMap<T extends TNotification> =
  T extends keyof TNotificationAddOns ? TNotificationAddOns[T] : never;

const createRessourceUrl: {
  [T in TNotification]: (addOns: TNotificationAddOnsMap<T>) => string | null;
} = {
  test: () => null,
  movieDownloaded: ({ tmdbId }) =>
    getUrl(CLIENT_ROUTES.CLIENT_MOVIE, { tmdbId }),
  movieDownloading: ({ tmdbId }) =>
    getUrl(CLIENT_ROUTES.CLIENT_MOVIE, { tmdbId }),
};

export const generateNotification = async <T extends TNotification>(
  forUserId: TUserSchema["id"] | TUserSchema["id"][],
  notification: T,
  addOns?: TNotificationAddOnsMap<T>
) => {
  const userIds = Array.isArray(forUserId) ? forUserId : [forUserId];

  const notificationPublisher = new EventsPublisher(
    userIds.map((userId) => ({
      event: "notification",
      userId,
    }))
  );

  const title = notificationsPayloads[notification].title;
  const message = notificationsPayloads[notification].message;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      type: notification,
      title,
      message,
      userId,
      resourceUrl: addOns ? createRessourceUrl[notification](addOns) : null,
    })),
  });

  await notificationPublisher.publish({
    title,
    message,
  });
};
