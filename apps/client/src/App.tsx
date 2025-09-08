import { SignInPage } from "@/pages/auth/signIn/SignIn.page";
import { SignUpPage } from "@/pages/auth/signUp/SignUp.page";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { getUrl } from "@hypertube/libs";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { ZodType } from "zod";
import { z } from "zod";
import { LoadingPage } from "./components/LoadingPage";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { authClient } from "./lib/auth-client";
import { ForgetPasswordPage } from "./pages/auth/forgetPassword/ForgetPasswordPage";
import { ResetPasswordPage } from "./pages/auth/resetPassword/ResetPasswordPage";
import MoviePage from "./pages/movie/movie.page";

const PublicRoute = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;

  if (session.isPending) return <LoadingPage resource="global" />;

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

  if (session.isPending) return <LoadingPage resource="global" />;

  if (!user) return <Navigate to={getUrl("client-signin")} replace />;

  return (
    <PrivateLayout>
      <Outlet />
    </PrivateLayout>
  );
};

const ProtectedRoute = <T extends Record<string, unknown>>({
  schema,
}: {
  schema: ZodType<T>;
}) => {
  const params = useParams();
  const result = schema.safeParse(params);

  if (!result.success) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};

const App = () => {
  const session = authClient.useSession();
  const navigate = useNavigate();
  console.log(session?.data?.user);

  return (
    <div className="h-dvh w-dvw flex justify-center items-center bg-background">
      <Button
        onClick={() => {
          navigate(
            getUrl("client-movie", {
              movieId: "00000000-0000-0000-0000-000000000000",
            })
          );
        }}
      >
        Demo movie
      </Button>
      <ScrollArea className="h-dvh w-dvw">
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path={getUrl("client-signin")} element={<SignInPage />} />
            <Route path={getUrl("client-signup")} element={<SignUpPage />} />
            <Route
              path={getUrl("client-forget-password")}
              element={<ForgetPasswordPage />}
            />
            <Route
              path={getUrl("client-reset-password")}
              element={<ResetPasswordPage />}
            />
          </Route>

          {/* Private routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="*" element={<NotFoundPage />} />
            <Route
              element={
                <ProtectedRoute
                  schema={z.object({
                    movieId: z.uuid(),
                  })}
                />
              }
            >
              <Route
                path={getUrl("client-movie", {
                  movieId: ":movieId",
                })}
                element={<MoviePage />}
              />
            </Route>
          </Route>
        </Routes>
      </ScrollArea>
    </div>
  );
};

export default App;
