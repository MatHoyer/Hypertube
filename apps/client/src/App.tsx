import { SignInPage } from "@/pages/auth/signIn/SignIn.page";
import { SignUpPage } from "@/pages/auth/signUp/SignUp.page";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import {
  getNotificationsSSESchemas,
  getUrl,
  NOTIFICATIONS_EVENTS,
} from "@hypertube/libs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { ForgetPasswordPage } from "./pages/auth/forgetPassword/ForgetPasswordPage";
import { ResetPasswordPage } from "./pages/auth/resetPassword/ResetPasswordPage";
import { ErrorPage } from "./pages/error/ErrorPage";
import { HomePage } from "./pages/home/home.page";
import MoviePage from "./pages/movie/movie.page";
import { MoviePageParamsSchema } from "./pages/movie/schemas/urlParams.schema";
import { NotificationsPage } from "./pages/notifications/notifications.page";
import { PlaygroundPage } from "./pages/playground/playground.page";
import { SettingsPage } from "./pages/profile/settings/SettingsPage";
import { BaseLayoutRoute } from "./routes/BaseLayoutRoute";
import { PrivateOnlyRoute } from "./routes/PrivateOnlyRoute";
import { ProtectedUrlRoute } from "./routes/ProtectedUrlRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

const App = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(getUrl("sse-notifications"));
    eventSource.onopen = () => {
      console.log("notifications SSE opened");
    };
    eventSource.onerror = (event: Event) => {
      console.error("notifications SSE error", event);
    };

    const handleNotification = (event: MessageEvent<string>) => {
      const { success, data } = getNotificationsSSESchemas.response.safeParse(
        JSON.parse(event.data)
      );
      if (!success) {
        console.error("invalid notification data", event.data);
        return;
      }
      console.log("new notification:", data);
      toast.info(data.title);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    eventSource.addEventListener(
      NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
      handleNotification
    );

    return () => {
      eventSource.close();
      eventSource.removeEventListener(
        NOTIFICATIONS_EVENTS.NEW_NOTIFICATION,
        handleNotification
      );
    };
  }, [queryClient]);

  return (
    <Routes>
      <Route element={<BaseLayoutRoute />}>
        {/* Default routes */}
        <Route index path="/" element={<HomePage />} />
        <Route index path="/error" element={<ErrorPage />} />
        <Route path="/demo" element={<PlaygroundPage />} />

        {/* Protected url routes */}
        <Route element={<ProtectedUrlRoute schema={MoviePageParamsSchema} />}>
          <Route
            path={getUrl("client-movie", {
              tmdbId: ":tmdbId",
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
        <Route element={<PrivateOnlyRoute />}>
          <Route
            path={getUrl("client-notifications")}
            element={<NotificationsPage />}
          />
          <Route path={getUrl("client-settings")} element={<SettingsPage />} />
        </Route>

        {/* Not found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
