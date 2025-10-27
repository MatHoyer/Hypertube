import z from "zod";
import {
  notificationReadStatusArray,
  notificationReadStatuses,
} from "../../const/global.const.js";
import { notificationSchema } from "../database/notifications.schema.js";

export const getNotificationsSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
    readStatus: z
      .enum(notificationReadStatusArray)
      .default(notificationReadStatuses.ALL),
  }),
  response: z.object({
    notifications: z.array(notificationSchema),
    totalUnreadNotifications: z.number().int(),
    page: z.number(),
    totalPages: z.number(),
    totalResults: z.number(),
  }),
};

export type TGetNotificationsSchemas = {
  searchParams: z.infer<typeof getNotificationsSchemas.searchParams>;
  response: z.infer<typeof getNotificationsSchemas.response>;
};

export const getNotificationsSSESchemas = {
  response: z.object({
    title: z.string().optional(),
    message: z.string().optional(),
    totalUnreadNotifications: z.number().int(),
  }),
};

export type TGetNotificationsSSESchemas = {
  response: z.infer<typeof getNotificationsSSESchemas.response>;
};

export const patchNotificationsSchemas = {
  urlParams: z.object({ notificationId: notificationSchema.shape.id }),
  requirements: z.object({
    read: z.boolean(),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPatchNotificationsSchemas = {
  urlParams: z.infer<typeof patchNotificationsSchemas.urlParams>;
  requirements: z.infer<typeof patchNotificationsSchemas.requirements>;
  response: z.infer<typeof patchNotificationsSchemas.response>;
};
