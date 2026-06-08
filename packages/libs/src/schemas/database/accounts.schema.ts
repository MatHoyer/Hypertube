import z from "zod";
import { userSchema } from "./user.schema.js";

export const accountsSchema = z.array(
  z.object({
    id: z.string(),
    userId: userSchema.shape.id,
    providerId: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    accountId: z.string(),
    scopes: z.array(z.string()),
  })
);
export type TAccountsSchema = z.infer<typeof accountsSchema>;
