import z from "zod";

export const imageSchema = z.object({
  id: z.union([z.uuid(), z.url()]),
  createdAt: z.date(),
});
export type TImageSchema = z.infer<typeof imageSchema>;
