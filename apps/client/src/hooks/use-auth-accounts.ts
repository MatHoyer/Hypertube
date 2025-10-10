import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useAuthAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const accounts = await authClient.listAccounts();
      return accounts.data;
    },
    retry: false,
  });

  return {
    accounts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
