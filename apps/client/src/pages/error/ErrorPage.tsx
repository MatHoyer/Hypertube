import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { NAVBAR_HEIGHT } from "@/layouts/BaseLayout";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { keyErrorCodes } from "@/lib/better-auth/constants";
import { cn } from "@/lib/utils";
import { getUrl } from "@hypertube/libs";
import { TriangleAlert } from "lucide-react";
import { useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const ErrorPage = () => {
  const [error, _] = useQueryState("error", { defaultValue: "" });
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <LayoutContent>
        <div
          className={cn(
            "flex justify-center items-center inset-0",
            `h-[calc(100dvh-${NAVBAR_HEIGHT}px)]`
          )}
        >
          <Card className="p-10 items-center text-center bg-primary/60">
            <TriangleAlert className="text-accent-foreground" size={100} />
            <Typography variant="h1">{t("global.error")}</Typography>
            <Typography variant="h3">
              {i18n.exists(`error.${error as (typeof keyErrorCodes)[number]}`)
                ? t(`error.${error as (typeof keyErrorCodes)[number]}`)
                : t("error.UNEXPECTED_ERROR")}
            </Typography>
            <Button
              variant={"secondary"}
              onClick={() => navigate(getUrl("client-home"))}
            >
              {t("global.homepage")}
            </Button>
          </Card>
        </div>
      </LayoutContent>
    </Layout>
  );
};
