import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { SignInPage } from "@/pages/signIn/SignIn.page";
import { SignUpPage } from "@/pages/signUp/SignUp.page";
import { getUrl } from "@hypertube/libs";
import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { z } from "zod";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { authClient } from "./lib/auth-client";
import MoviePage from "./pages/movie/movie.page";

const PublicRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
};

const PrivateRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (!user) return <Navigate to={getUrl("client-signin")} replace />;
  return (
    <PrivateLayout>
      <Outlet />
    </PrivateLayout>
  );
};

const ProtectedRoute = ({ param, schema }: { param: string; schema: z.ZodSchema }) => {
  const params = useParams();

  const paramValue = params[param];
  const isValid = schema.safeParse(paramValue).success;

  if (!isValid) {
    return <NotFoundPage />;
  }

  return <Outlet />
}

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
          <Route element={<ProtectedRoute param="movieId" schema={z.uuid()} />}>
            <Route
              path={getUrl("client-movie", {
                movieId: ":movieId",
              })}
              element={<MoviePage />}
            />
          </Route>
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
