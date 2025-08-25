import { LanguageSwitcher } from "../components/LanguageSwitcher";

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="size-full flex flex-col items-center justify-center">
      <LanguageSwitcher />
      {children}
    </div>
  );
};