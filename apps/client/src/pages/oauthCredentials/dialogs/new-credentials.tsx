import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmallCopyDisplay } from "@/components/ui/small-copy-display";
import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

export const NewCredentialsDialog: React.FC<{
  clientId: string;
  clientSecret: string;
}> = ({ clientId, clientSecret }) => {
  const { t } = useTranslation();

  return (
    <DialogContent className="overflow-x-hidden">
      <DialogHeader>
        <DialogTitle>{t("oauthCredentials.newCredential.title")}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="flex flex-col gap-1">
        <Typography variant="span">
          {t("oauthCredentials.newCredential.description.1")}
        </Typography>
        <Typography variant="span">
          {t("oauthCredentials.newCredential.description.2")}
        </Typography>
        <Typography variant="span">
          {t("oauthCredentials.newCredential.description.3")}
        </Typography>
      </DialogDescription>
      <div className="flex flex-col gap-2 w-full min-w-0">
        <SmallCopyDisplay
          value={clientId}
          label={t("oauthCredentials.newCredential.clientId")}
        />
        <SmallCopyDisplay
          value={clientSecret}
          label={t("oauthCredentials.newCredential.clientSecret")}
        />
      </div>
    </DialogContent>
  );
};
