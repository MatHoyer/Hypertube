import { useTranslation } from "react-i18next";
import { useAuth } from "./use-auth";

/**
 * Hook to get the authenticated user.
 * WARNING: Should ONLY be used on private routes when the user is logged in.
 * This hook uses cache to infer the type and will throw an error if the user is not authenticated.
 */
export const useRequiredUser = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  if (!user) throw new Error(t("better-auth-error.ACCOUNT_NOT_FOUND"));

  return user;
};
