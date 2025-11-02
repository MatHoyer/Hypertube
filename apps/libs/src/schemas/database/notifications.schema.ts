import z from "zod";
import { notifications } from "../../const/notifications.const.js";

export const notificationSchema = z.object({
  id: z.string(),
  read: z.coerce.boolean().default(false),
  type: z.enum(notifications),
  title: z.string(),
  message: z.string(),
  resourceUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TNotificationSchema = z.infer<typeof notificationSchema>;
