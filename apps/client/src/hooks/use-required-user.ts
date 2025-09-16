import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useRequiredUser = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data?.user ?? null;
    },
  });

  if (isLoading) return { user: null, isLoading: true, isError: false };
  if (isError || !data) return { user: null, isLoading: false, isError: true };

  return { user: data, isLoading: false, isError: false };
};
