import { getServerUrl } from "@hypertube/libs";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [usernameClient()],
});
