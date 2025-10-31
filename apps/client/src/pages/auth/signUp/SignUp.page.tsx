import { Button } from "@/components/ui/button";
import { TextSeparator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { OAuthButtons } from "../OAuthButtons";
import { SignUpForm } from "./components/SignUpForm";

export const SignUpPage = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <LayoutContent>
        <AuthLayout title={t("sign.up")}>
          <OAuthButtons />
          <TextSeparator>{t("global.or")}</TextSeparator>
          <SignUpForm />
          <div className="flex items-center">
            <Typography variant="small">{t("sign.gotAccount")}</Typography>
            <Button type="button" variant={"link"} asChild>
              <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
            </Button>
          </div>
        </AuthLayout>
      </LayoutContent>
    </Layout>
  );
};
