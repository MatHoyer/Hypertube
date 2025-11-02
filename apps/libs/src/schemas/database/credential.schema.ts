import z from "zod";

export const credentialSchema = z.object({
  id: z.uuid(),
  clientId: z.string(),
  clientSecret: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TCredentialSchema = z.infer<typeof credentialSchema>;
