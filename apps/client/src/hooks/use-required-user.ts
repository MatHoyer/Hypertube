import { authClient } from "@/lib/auth-client";

export const useRequiredUser = () => {
  const session = authClient.useSession();
  const user = session.data?.user;
  if (!user) throw new Error("User not sign-in");
  return user;
};
