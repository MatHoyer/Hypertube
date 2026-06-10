import z from "zod";

export const accountsSchema = z.array(
  z.object({
    id: z.string(),
    providerId: z.string(),
    provider: z.string(),
    providerEmail: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    accountId: z.string(),
    scopes: z.array(z.string()),
  })
);
export type TAccountsSchema = z.infer<typeof accountsSchema>;
