import z from "zod";
import { betterAuthProviders, credentialId } from "../../const/global.const.js";

export const accountsSchema = z.array(
  z.object({
    id: z.string(),
    providerId: z.enum([...betterAuthProviders, credentialId]),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    accountId: z.string(),
    scopes: z.array(z.string()),
  })
);
export type TAccountsSchema = z.infer<typeof accountsSchema>;
