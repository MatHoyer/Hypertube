import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { getUrl, ROUTES } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <LayoutContent>
        <AuthLayout title={t("sign.resetPassword")}>
          <ResetPasswordForm />
          <div className="flex items-center">
            <Typography variant="small">
              {t("sign.rememberPassword")}
            </Typography>
            <Button type="button" variant={"link"} asChild>
              <Link to={getUrl(ROUTES.CLIENT.SIGNIN)}>
                {t("sign.backToSignin")}
              </Link>
            </Button>
          </div>
        </AuthLayout>
      </LayoutContent>
    </Layout>
  );
};
