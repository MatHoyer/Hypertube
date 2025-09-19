import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { useTranslation } from "react-i18next";
import { useAuth } from "./use-auth";

export const useRequiredUser = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  if (!user) throw new Error(betterAuthTranslation(t, "USER_NOT_FOUND"));

  return user;
};
