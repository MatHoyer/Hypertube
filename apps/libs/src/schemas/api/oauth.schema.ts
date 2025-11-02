import z from "zod";
import { credentialSchema } from "../database/credential.schema.js";

export const getCredentialsSchemas = {
  response: z.array(credentialSchema.omit({ clientSecret: true })),
};
export type TGetCredentialsSchemas = {
  response: z.infer<typeof getCredentialsSchemas.response>;
};

export const postCredentialsSchemas = {
  requirements: z.object({
    name: credentialSchema.shape.name,
  }),
  response: z.object({
    clientId: credentialSchema.shape.clientId,
    clientSecret: credentialSchema.shape.clientSecret,
  }),
};
export type TPostCredentialsSchemas = {
  requirements: z.infer<typeof postCredentialsSchemas.requirements>;
  response: z.infer<typeof postCredentialsSchemas.response>;
};

export const deleteCredentialsSchemas = {
  urlParams: z.object({
    credentialId: credentialSchema.shape.id,
  }),
  response: z.object({
    message: z.string(),
  }),
};
export type TDeleteCredentialsSchemas = {
  urlParams: z.infer<typeof deleteCredentialsSchemas.urlParams>;
  response: z.infer<typeof deleteCredentialsSchemas.response>;
};

export const postTokenSchemas = {
  requirements: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    grant_type: z.enum(["client_credentials"]),
  }),
  response: z.object({
    access_token: z.string(),
    expires_in: z.int(),
    token_type: z.enum(["Bearer"]),
    expires_at: z.int(),
  }),
};
export type TPostTokenSchemas = {
  requirements: z.infer<typeof postTokenSchemas.requirements>;
  response: z.infer<typeof postTokenSchemas.response>;
};
