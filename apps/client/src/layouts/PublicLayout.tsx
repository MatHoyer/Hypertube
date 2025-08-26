import { LanguageSwitcher } from "../components/LanguageSwitcher";

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
     <div className="size-full">
      <LanguageSwitcher />
      {children}
    </div>
  );
};