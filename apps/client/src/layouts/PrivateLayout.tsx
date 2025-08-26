import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { SignOutButton } from "../components/LogOutButton";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <LanguageSwitcher />
      {children}
      <SignOutButton />
    </div>
  );
};
