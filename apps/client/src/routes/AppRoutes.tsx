import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { SignInForm } from "../components/SignInForm";
import { SignUpForm } from "../components/SignUpForm";
import { authClient } from "../lib/auth-client";
import { PublicLayout } from "../layouts/PublicLayout"
import { PrivateLayout } from "../layouts/PrivateLayout";

const PublicRoute = () => {
  const user = authClient.useSession();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const PrivateRoute = () => {
  const user = authClient.useSession();
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route
          path="/signin"
          element={
            <PublicLayout>
              <SignInForm />
            </PublicLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicLayout>
              <SignUpForm />
            </PublicLayout>
          }
        />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route
          path="/dashboard"
          element={
            <PrivateLayout>
              <div>Dashboard</div>
            </PrivateLayout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
};
