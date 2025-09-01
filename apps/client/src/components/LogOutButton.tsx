import { authClient } from "@/lib/auth-client";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

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
