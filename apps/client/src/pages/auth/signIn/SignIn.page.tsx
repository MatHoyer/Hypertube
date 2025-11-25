import { Button } from "@/components/ui/button";
import { TextSeparator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { getUrl, ROUTES } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { OAuthButtons } from "../OAuthButtons";
import { SignInForm } from "./components/SignInForm";

export const SignInPage = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <LayoutContent>
        <AuthLayout title={t("sign.in")}>
          <OAuthButtons />
          <TextSeparator>{t("global.or")}</TextSeparator>
          <SignInForm />
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl(ROUTES.CLIENT.FORGET_PASSWORD)}>
              {t("sign.forgetPassword")}
            </Link>
          </Button>
          <div className="flex items-center">
            <Typography textSize="sm">{t("sign.missAccount")}</Typography>
            <Button type="button" variant={"link"} asChild>
              <Link to={getUrl(ROUTES.CLIENT.SIGNUP)}>{t("sign.up")}</Link>
            </Button>
          </div>
        </AuthLayout>
      </LayoutContent>
    </Layout>
  );
};
