import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { useTranslation } from "react-i18next";
import { useAuth } from "./use-auth";

export const useRequiredAuth = () => {
  const { t } = useTranslation();

  const data = useAuth();

  if (!data.data) throw new Error(betterAuthTranslation(t, "USER_NOT_FOUND"));

  return data.data;
};
