import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      if (!res.data) return res.data;
      const accounts = await authClient.listAccounts();
      return {
        user: res.data.user,
        session: res.data.session,
        accounts: accounts.data,
      };
    },
    retry: false,
  });

  return {
    user: query.data?.user,
    session: query.data?.session,
    accounts: query.data?.accounts ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
