import { SignInPage } from "@/pages/auth/signIn/SignIn.page";
import { SignUpPage } from "@/pages/auth/signUp/SignUp.page";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { ROUTES, getUrl } from "@hypertube/libs";
import { Route, Routes } from "react-router-dom";
import { ForgetPasswordPage } from "./pages/auth/forgetPassword/ForgetPasswordPage";
import { ResetPasswordPage } from "./pages/auth/resetPassword/ResetPasswordPage";
import { ErrorPage } from "./pages/error/ErrorPage";
import { LibraryPage } from "./pages/library/library.page";
import MoviePage from "./pages/movie/movie.page";
import { MoviePageParamsSchema } from "./pages/movie/schemas/urlParams.schema";
import { NotificationsPage } from "./pages/notifications/notifications.page";
import { OAuthCredentialsPage } from "./pages/oauthCredentials/oauth-credentials.page";
import { PlaygroundPage } from "./pages/playground/playground.page";
import { SettingsPage } from "./pages/profile/settings/SettingsPage";
import { BaseLayoutRoute } from "./routes/BaseLayoutRoute";
import { PrivateOnlyRoute } from "./routes/PrivateOnlyRoute";
import { ProtectedUrlRoute } from "./routes/ProtectedUrlRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<BaseLayoutRoute />}>
        {/* Default routes */}
        <Route index path="/" element={<LibraryPage />} />
        <Route index path="/error" element={<ErrorPage />} />
        <Route path="/demo" element={<PlaygroundPage />} />

        {/* Public only routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path={getUrl(ROUTES.CLIENT.SIGNIN)} element={<SignInPage />} />
          <Route path={getUrl(ROUTES.CLIENT.SIGNUP)} element={<SignUpPage />} />
          <Route
            path={getUrl(ROUTES.CLIENT.FORGET_PASSWORD)}
            element={<ForgetPasswordPage />}
          />
          <Route
            path={getUrl(ROUTES.CLIENT.RESET_PASSWORD)}
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* Private only routes */}
        <Route element={<PrivateOnlyRoute />}>
          <Route
            path={getUrl(ROUTES.CLIENT.NOTIFICATIONS)}
            element={<NotificationsPage />}
          />
          <Route
            path={getUrl(ROUTES.CLIENT.SETTINGS)}
            element={<SettingsPage />}
          />
          <Route
            path={getUrl(ROUTES.CLIENT.OAUTH_CREDENTIALS)}
            element={<OAuthCredentialsPage />}
          />
          <Route element={<ProtectedUrlRoute schema={MoviePageParamsSchema} />}>
            <Route
              path={getUrl(ROUTES.CLIENT.MOVIE, {
                tmdbId: ":tmdbId",
              })}
              element={<MoviePage />}
            />
          </Route>
        </Route>

        {/* Not found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
