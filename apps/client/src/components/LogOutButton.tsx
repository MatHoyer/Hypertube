import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export const SignOutButton = () => {
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => {
        authClient.signOut();
      }}
    >
      {t("sign.out")}
    </Button>
  );
};
