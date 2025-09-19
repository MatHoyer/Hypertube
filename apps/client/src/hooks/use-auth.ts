import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const useAuth = () => {
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      if (!res.data)
        throw new Error(betterAuthTranslation(t, "USER_NOT_FOUND"));
      return res.data;
    },
    retry: false,
  });

  return query;
};
