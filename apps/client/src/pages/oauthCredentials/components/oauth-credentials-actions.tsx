import { openDialog } from "@/components/dialogs/dialog.store";
import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getUrl, postCredentialsSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const OAuthCredentialsActions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutate: addCredential,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-oauth-credentials"),
        schemas: postCredentialsSchemas,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      openDialog("newCredential", {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
      });
    },
  });

  return (
    <div className="flex items-center justify-between w-full">
      <LoadingButton
        loading={isPending}
        success={isSuccess}
        onClick={() => addCredential()}
      >
        {t("oauthCredentials.actions.addCredential")}
      </LoadingButton>
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
