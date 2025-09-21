import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data;
    },
    retry: false,
  });

  return {
    user: query.data?.user,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
