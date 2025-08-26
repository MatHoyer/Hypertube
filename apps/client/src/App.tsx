import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { PublicLayout } from "./layouts/PublicLayout"
import { authClient } from "./lib/auth-client";
import { SignInPage } from "@/pages/signInPage/SignInPage";
import { SignUpPage } from "@/pages/signUpPage/SignUpPage";
import { getUrl } from "@hypertube/libs";
import { NotFoundPage } from "@/pages/notFoundPage/NotFoundPage";

const signInPath = getUrl("client-signin");
const signUpPath = getUrl("client-signup");

const PublicRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  )
};

const PrivateRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (!user) return <Navigate to={signInPath} replace />;
  return (
    <PrivateLayout>
      <Outlet />
    </PrivateLayout>
  )
};

const App = () => {
  const session = authClient.useSession();
  console.log(session?.data?.user);

  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <Routes>
        {/* Routes publiques */}
        <Route element={<PublicRoute />}>
          <Route path={signInPath} element={<SignInPage />} />
          <Route path={signUpPath} element={<SignUpPage />} />
        </Route>

        {/* Routes privées */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
