import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const SignOutButton = () => {
  return (
    <Button
      onClick={() => {
        authClient.signOut();
      }}
    >
      Log Out
    </Button>
  );
};
