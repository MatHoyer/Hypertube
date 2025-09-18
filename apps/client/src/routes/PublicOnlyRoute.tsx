import { LoadingPage } from "@/components/LoadingPage";
import { authClient } from "@/lib/auth-client";
import { getUrl } from "@hypertube/libs";
import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (session.isPending) return <LoadingPage resource="global" />;

  if (user) return <Navigate to={getUrl("client-home")} replace />;

  return <Outlet />;
};
