import { AuthLayout } from "../AuthLayout";
import { SignInForm } from "./components/SignInForm";

export const SignInPage = () => {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
};
