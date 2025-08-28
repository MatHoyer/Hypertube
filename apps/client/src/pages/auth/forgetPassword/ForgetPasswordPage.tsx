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
      <ForgetPasswordForm />
      <Typography variant="small">
        {t("sign.rememberPassword")}
        <Button
          type="button"
          variant={"link"}
          className="text-muted-foreground"
          asChild
        >
          <Link to={getUrl("client-signin")}>{t("sign.backToSignin")}</Link>
        </Button>
      </Typography>
    </AuthLayout>
  );
};
