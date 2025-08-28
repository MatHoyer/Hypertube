import { Button } from "@/components/ui/button";
import { TextSeparator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { OAuthButtons } from "../OAuthButtons";
import { SignInForm } from "./components/SignInForm";

export const SignInPage = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout className="w-1/5" title={t("sign.in")}>
      <OAuthButtons />
      <TextSeparator>{t("global.or")}</TextSeparator>
      <SignInForm className="w-4/5" />
      <Button
        type="button"
        variant={"link"}
        className="text-muted-foreground"
        asChild
      >
        <Link to={getUrl("client-forget-password")}>
          {t("sign.forgetPassword")}
        </Link>
      </Button>
      <div className="flex items-center">
        <Typography variant="small">{t("sign.missAccount")}</Typography>
        <Button type="button" variant={"link"} asChild>
          <Link to={getUrl("client-signup")}>
            <Typography variant="muted">{t("sign.up")}</Typography>
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
};
