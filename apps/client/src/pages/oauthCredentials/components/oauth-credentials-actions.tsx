import { openDialog } from "@/components/dialogs/dialog.store";
import { Button } from "@/components/ui/button";
import { getUrl, ROUTES } from "@hypertube/libs";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const OAuthCredentialsActions = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between w-full">
      <Button onClick={() => openDialog("postCredentials")}>
        {t("oauthCredentials.actions.addCredential")}
      </Button>
      <div>
        <Button asChild>
          <Link
            to={getUrl(ROUTES.API.SWAGGER, {
              mode: "ui",
              withUrl: "server",
            })}
            target="_blank"
          >
            <File /> {t("oauthCredentials.actions.openDocumentation")}
          </Link>
        </Button>
      </div>
    </div>
  );
};
