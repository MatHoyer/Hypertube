import { TUserSchema } from "@hypertube/libs";
import { prisma } from "../prisma.js";
import { EventsPublisher } from "../redis/EventsPubSub.js";
import { TNotification } from "./notifications.js";

export const notificationsPayloads: Record<
  TNotification,
  { title: string; message: string }
> = {
  test: {
    title: "notifications.test.title",
    message: "notifications.test.message",
  },
};

type TNotificationAddOns = {
  test: {
    someId: number;
  };
};

type TNotificationAddOnsMap<T extends TNotification> =
  T extends keyof TNotificationAddOns ? TNotificationAddOns[T] : never;

const createRessourceUrl: {
  [T in TNotification]: (addOns: TNotificationAddOnsMap<T>) => string;
} = {
  test: ({ someId }) => `/test/${someId}`,
};

export const generateNotification = async <T extends TNotification>(
  forUserId: TUserSchema["id"],
  notification: T,
  addOns: TNotificationAddOnsMap<T>
) => {
  const notificationPublisher = new EventsPublisher({
    event: "notification",
    userId: forUserId,
  });

  const title = notificationsPayloads[notification].title;
  const message = notificationsPayloads[notification].message;

  await prisma.notification.create({
    data: {
      title,
      message,
      userId: forUserId,
      resourceUrl: createRessourceUrl[notification](addOns),
    },
  });

  await notificationPublisher.publish({
    title,
    message,
  });
};
