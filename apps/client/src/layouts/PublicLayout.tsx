import { LanguageSwitcher } from "../components/LanguageSwitcher";

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <LanguageSwitcher />
      {children}
    </div>
  );
};