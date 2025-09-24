import z from "zod";

export const imageSchema = z.object({
  id: z.uuid(),
  createdAt: z.date(),
});
export type TImageSchema = z.infer<typeof imageSchema>;
