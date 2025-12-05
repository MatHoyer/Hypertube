import { LoadingResource } from "@/components/LoadingResource";
import { useAuth } from "@/hooks/use-auth";
import { getUrl, ROUTES } from "@hypertube/libs";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateOnlyRoute = () => {
  const { user, isLoading, isError } = useAuth();

  if (isLoading) return <LoadingResource resource="global" />;

  if (isError || !user)
    return <Navigate to={getUrl(ROUTES.CLIENT.SIGNIN)} replace />;

  return <Outlet />;
};
