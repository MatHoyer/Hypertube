import { authClient } from "./lib/auth-client";
import MoviePage from "./pages/movie/movie.page";

const App = () => {
  const user = authClient.useSession();
  console.log(user);

  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <MoviePage />
    </div>
  );
};

export default App;
