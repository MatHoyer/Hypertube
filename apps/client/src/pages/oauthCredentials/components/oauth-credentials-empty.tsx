import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";

export const OAuthCredentialsEmpty = () => {
  const { t } = useTranslation();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <File />
        </EmptyMedia>
        <EmptyTitle>{t("oauthCredentials.empty.title")}</EmptyTitle>
        <EmptyDescription>
          {t("oauthCredentials.empty.description")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
