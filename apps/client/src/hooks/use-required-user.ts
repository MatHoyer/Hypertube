import { useTranslation } from "react-i18next";
import { useAuth } from "./use-auth";

export const useRequiredUser = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  if (!user) throw new Error(t("better-auth-error.ACCOUNT_NOT_FOUND"));

  return user;
};
