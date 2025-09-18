import { LoadingPage } from "@/components/LoadingPage";
import { authClient } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (session.isPending) return <LoadingPage resource="global" />;

  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
