import { openDialog } from "@/components/dialogs/dialog.store";
import { Button } from "@/components/ui/button";
import { getUrl, ROUTES } from "@hypertube/libs";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

export const OAuthCredentialsActions = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between w-full">
      <Button onClick={() => openDialog("postCredentials")}>
        {t("oauthCredentials.actions.addCredential")}
      </Button>
      <div>
        <Button className="w-full md:w-auto" variant="outline" asChild>
          <Link
            to={serverUrl + getUrl(ROUTES.API.SWAGGER, { mode: "ui" })}
            target="_blank"
            className="flex-1 md:flex-none"
          >
            <File /> {t("oauthCredentials.actions.openDocumentation")}
          </Link>
        </Button>
      </div>
    </div>
  );
};
