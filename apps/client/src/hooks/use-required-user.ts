import { authClient, type TSession } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useRequiredUser = () => {
  const queryClient = useQueryClient();
  const cacheData = queryClient.getQueryData<TSession>(["session"]);

  const { data } = useQuery({
    queryKey: ["session", { id: cacheData?.user.id }],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data?.user ?? null;
    },
  });

  return data;
};
