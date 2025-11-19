import { openAlertDialog } from "@/components/dialogs/alert-dialog.store";
import { LoadingButton } from "@/components/LoadingButton";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteCredentialsSchemas,
  getUrl,
  ROUTES,
  type TGetCredentialsSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const OathCredential: React.FC<{
  credential: TGetCredentialsSchemas["response"][number];
}> = ({ credential }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    mutate: deleteCredential,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.OAUTH_CREDENTIALS, {
          credentialId: credential.id,
        }),
        schemas: deleteCredentialsSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.OAUTH_CREDENTIALS),
      });
      toast.success(t("oauthCredentials.deleteCredentialSuccess"));
    },
  });

  return (
    <Card className="flex flex-col items-center gap-2">
      <Typography variant="h3">{credential.name}</Typography>
      <Typography variant="code">{credential.clientId}</Typography>
      <LoadingButton
        variant="destructive"
        size="icon"
        loading={isPending}
        success={isSuccess}
        onClick={() =>
          openAlertDialog(() => deleteCredential(), {
            doubleConfirm: true,
            confirmTextToType: credential.name,
          })
        }
      >
        <Trash2 />
      </LoadingButton>
    </Card>
  );
};
