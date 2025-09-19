import { LoadingPage } from "@/components/LoadingPage";
import { useRequiredAuth } from "@/hooks/use-required-auth";
import { getUrl } from "@hypertube/libs";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateOnlyRoute = () => {
  const { data, isLoading, isError } = useRequiredAuth();

  if (isLoading) return <LoadingPage resource="global" />;

  if (isError || !data)
    return <Navigate to={getUrl("client-signin")} replace />;

  return <Outlet />;
};
