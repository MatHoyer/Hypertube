import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { ForgetPasswordForm } from "./components/ForgetPasswordForm";

export const ForgetPasswordPage = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout className="w-1/4" title={t("sign.forgetPassword")}>
      <ForgetPasswordForm className="w-full" />
      <div className="flex items-center">
        <Typography variant="small">{t("sign.rememberPassword")}</Typography>
        <Button type="button" variant={"link"} asChild>
          <Link to={getUrl("client-signin")}>
            <Typography variant="muted">{t("sign.backToSignin")}</Typography>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
};
