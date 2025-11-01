import { Button } from "@/components/ui/button";
import { getUrl } from "@hypertube/libs";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const OAuthCredentialsActions = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between w-full">
      <Button>{t("oauthCredentials.actions.addCredential")}</Button>
      <div>
        <Button asChild>
          <Link
            to={getUrl("api-swagger", { mode: "ui", withUrl: "server" })}
            target="_blank"
          >
            <File /> {t("oauthCredentials.actions.openDocumentation")}
          </Link>
        </Button>
      </div>
    </div>
  );
};
