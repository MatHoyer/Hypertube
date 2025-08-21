import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { getServerUrl } from "@hypertube/libs";

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [usernameClient()],
});
