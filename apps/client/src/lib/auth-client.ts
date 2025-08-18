import { createAuthClient } from "better-auth/react";
import { getServerUrl } from "@hypertube/libs";
import {
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "../../../server/src/lib/auth";

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string" },
        lastName: { type: "string" },
      },
    }),
    customSessionClient<typeof auth>(),
  ],
});
