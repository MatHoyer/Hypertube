import { useTranslation } from "react-i18next";
import { SignInForm } from "./components/SignInForm";

export const SignInPage = () => {
  const { t } = useTranslation();

  return (
    <div className="size-full">
      <SignInForm />
    </div>
  );
};
