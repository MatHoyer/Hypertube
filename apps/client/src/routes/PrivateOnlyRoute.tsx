import { LoadingPage } from "@/components/LoadingPage";
import { authClient } from "@/lib/auth-client";
import { getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateOnlyRoute = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data;
    },
  });

  if (isLoading) return <LoadingPage resource="global" />;

  if (isError || !data)
    return <Navigate to={getUrl("client-signin")} replace />;

  return <Outlet />;
};
