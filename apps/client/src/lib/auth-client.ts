import { getServerUrl } from "@hypertube/libs";
import {
  genericOAuthClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type TSession = typeof authClient.$Infer.Session;

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [
    usernameClient(),
    genericOAuthClient(),
    inferAdditionalFields({
      user: {
        firstName: { type: "string" },
        lastName: { type: "string" },
      },
    }),
  ],
});
