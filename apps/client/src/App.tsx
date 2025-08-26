import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { PublicLayout } from "./layouts/PublicLayout"
import { authClient } from "./lib/auth-client";
import { SignInPage } from "@/pages/signIn/SignIn.page";
import { SignUpPage } from "@/pages/signUp/SignUp.page";
import { getUrl } from "@hypertube/libs";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";

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

  if (!user) return <Navigate to={getUrl("client-signin")} replace />;
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
          <Route path={getUrl("client-signin")} element={<SignInPage />} />
          <Route path={getUrl("client-signup")} element={<SignUpPage />} />
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
