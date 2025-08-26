import { authClient } from "./lib/auth-client";
import { AppRoutes } from "./routes/AppRoutes";

const App = () => {
  const user = authClient.useSession();
  console.log(user);

  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <AppRoutes />
    </div>
  );
};

export default App;
