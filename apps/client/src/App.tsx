import { SignInForm } from "./components/SignInForm";
import { SignOutButton } from "./components/LogOutButton";
import { SignUpForm } from "./components/SignUpForm";
import { authClient } from "./lib/auth-client";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

const App = () => {
  const user = authClient.useSession();
  console.log(user);
  return (
    <div className="size-full flex justify-center items-center">
      <LanguageSwitcher />
      <SignUpForm />
      <SignInForm />
      <SignOutButton />
    </div>
  );
};

export default App;
