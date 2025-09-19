import { LoadingPage } from "@/components/LoadingPage";
import { useAuth } from "@/hooks/use-auth";
import { getUrl } from "@hypertube/libs";
import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
  const { user, isLoading, isError } = useAuth();

  if (isLoading) return <LoadingPage resource="global" />;

  if (!isError && user) return <Navigate to={getUrl("client-home")} replace />;

  return <Outlet />;
};
