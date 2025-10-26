import z from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  read: z.coerce.boolean().default(false),
  title: z.string(),
  message: z.string(),
  resourceUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TNotificationSchema = z.infer<typeof notificationSchema>;
