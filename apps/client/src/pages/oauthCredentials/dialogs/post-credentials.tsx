import { openDialog } from "@/components/dialogs/dialog.store";
import { LoadingButton } from "@/components/LoadingButton";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { API_ROUTES, getUrl, postCredentialsSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const PostCredentialsDialog = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const {
    mutate: postCredentials,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (name: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl(API_ROUTES.API_OAUTH_CREDENTIALS),
        schemas: postCredentialsSchemas,
        data: { name },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(API_ROUTES.API_OAUTH_CREDENTIALS),
      });
      openDialog("newCredential", {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
      });
    },
  });

  return (
    <DialogContent className="overflow-x-hidden">
      <DialogHeader>
        <DialogTitle>{t("oauthCredentials.newCredential.title")}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="flex flex-col gap-1">
        {t("oauthCredentials.postCredentials.description")}
      </DialogDescription>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("oauthCredentials.postCredentials.namePlaceholder")}
      />

      <DialogFooter>
        <LoadingButton
          loading={isPending}
          success={isSuccess}
          onClick={() => postCredentials(name)}
          disabled={!name}
        >
          {t("oauthCredentials.postCredentials.submit")}
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  );
};
