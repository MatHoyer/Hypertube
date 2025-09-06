import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/LogOutButton";
import { Navbar } from "@/components/Navbar";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="size-full">
      <Navbar />
      <LanguageSwitcher />
      {children}
      <SignOutButton />
    </div>
  );
};
