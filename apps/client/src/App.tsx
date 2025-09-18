import { SignInPage } from "@/pages/auth/signIn/SignIn.page";
import { SignUpPage } from "@/pages/auth/signUp/SignUp.page";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { getUrl } from "@hypertube/libs";
import { Route, Routes } from "react-router-dom";
import { ForgetPasswordPage } from "./pages/auth/forgetPassword/ForgetPasswordPage";
import { ResetPasswordPage } from "./pages/auth/resetPassword/ResetPasswordPage";
import { HomePage } from "./pages/home/home.page";
import MoviePage, { MoviePageParamsSchema } from "./pages/movie/movie.page";
import { PlaygroundPage } from "./pages/playground/playground.page";
import { BaseLayoutRoute } from "./routes/BaseLayoutRoute";
import { PrivateOnlyRoute } from "./routes/PrivateOnlyRoute";
import { ProtectedUrlRoute } from "./routes/ProtectedUrlRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<BaseLayoutRoute />}>
        {/* Default routes */}
        <Route index path="/" element={<HomePage />} />
        <Route path="/demo" element={<PlaygroundPage />} />

        {/* Protected url routes */}
        <Route element={<ProtectedUrlRoute schema={MoviePageParamsSchema} />}>
          <Route
            path={getUrl("client-movie", {
              movieId: ":movieId",
            })}
            element={<MoviePage />}
          />
        </Route>

        {/* Public only routes */}
        <Route element={<PublicOnlyRoute />}>
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

        {/* Private only routes */}
        <Route element={<PrivateOnlyRoute />}></Route>

        {/* Not found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
