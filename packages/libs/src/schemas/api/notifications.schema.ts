import z from "zod";
import {
  notificationReadStatusArray,
  notificationReadStatuses,
} from "../../const/global.const.js";
import { notificationSchema } from "../database/notifications.schema.js";
import { getPaginationSchemas } from "../utils/pagination.schema.js";

export const getNotificationsSchemas = getPaginationSchemas({
  searchParams: z.object({
    readStatus: z
      .enum(notificationReadStatusArray)
      .default(notificationReadStatuses.ALL),
  }),
  response: z.object({
    notifications: z.array(notificationSchema),
  }),
});

export type TGetNotificationsSchemas = {
  searchParams: z.infer<typeof getNotificationsSchemas.searchParams>;
  response: z.infer<typeof getNotificationsSchemas.response>;
};

export const patchNotificationsSchemas = {
  requirements: z.object({
    read: z.boolean(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPatchNotificationsSchemas = {
  requirements: z.infer<typeof patchNotificationsSchemas.requirements>;
  response: z.infer<typeof patchNotificationsSchemas.response>;
};

export const getNotificationsSSESchemas = {
  response: z.object({
    title: z.string().optional(),
    message: z.string().optional(),
  }),
};

export type TGetNotificationsSSESchemas = {
  response: z.infer<typeof getNotificationsSSESchemas.response>;
};

export const getNotificationsStatsSchemas = {
  response: z.object({
    totalUnreadNotifications: z.number().int(),
  }),
};

export type TGetNotificationsStatsSchemas = {
  response: z.infer<typeof getNotificationsStatsSchemas.response>;
};

export const patchNotificationSchemas = {
  urlParams: z.object({ notificationId: notificationSchema.shape.id }),
  requirements: z.object({
    read: z.boolean(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPatchNotificationSchemas = {
  urlParams: z.infer<typeof patchNotificationSchemas.urlParams>;
  requirements: z.infer<typeof patchNotificationSchemas.requirements>;
  response: z.infer<typeof patchNotificationSchemas.response>;
};

export const postSendTestNotificationSchemas = {
  response: z.object({
    message: z.string(),
  }),
};

export type TPostSendTestNotificationSchemas = {
  response: z.infer<typeof postSendTestNotificationSchemas.response>;
};
