import { LoadingButton } from "@/components/LoadingButton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthAccounts } from "@/hooks/use-auth-accounts";
import { supportedOAuths } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import type { TBetterAuthProviders } from "@hypertube/libs";
import {
  betterAuthProviders,
  getUrl,
  linkProviderAuthentificationSchemas,
  unlinkProviderAuthentificationSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const OAuthLinkButtons = () => {
  const { accounts } = useAuthAccounts();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const linkedAccounts = accounts.map((account) => account.provider);

  const {
    mutate: linkMutate,
    isPending: isLinkPending,
    isSuccess: isLinkSuccess,
    variables: linkVariables,
  } = useMutation({
    mutationFn: (provider: { id: (typeof betterAuthProviders)[number] }) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-authentification-link"),
        schemas: linkProviderAuthentificationSchemas,
        data: {
          providerId: provider.id,
        },
      }),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_self");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const {
    mutate: unlinkMutate,
    isPending: isUnlinkPending,
    isSuccess: isUnlinkSuccess,
    variables: unlinkVariables,
  } = useMutation({
    mutationFn: async (provider: {
      id: (typeof betterAuthProviders)[number];
    }) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl("api-authentification-link", { providerId: provider.id }),
        schemas: unlinkProviderAuthentificationSchemas,
        data: {
          providerId: provider.id,
        },
      }),
    onSuccess: () => {
      toast.success(t("settings.unlinkMessage"));
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(supportedOAuths).map(([providerId, params]) => (
        <Card key={providerId}>
          <CardContent className="flex flex-col gap-2">
            <img
              src={params.img}
              draggable={false}
              alt={params.name}
              title={params.name}
            />
            {linkedAccounts.includes(providerId) ? (
              <LoadingButton
                variant={"destructive"}
                loading={isLinkPending || isUnlinkPending}
                success={
                  [linkVariables?.id, unlinkVariables?.id].includes(
                    providerId as TBetterAuthProviders
                  )
                    ? isLinkSuccess || isUnlinkSuccess
                    : undefined
                }
                onClick={() =>
                  unlinkMutate({
                    id: providerId as TBetterAuthProviders,
                  })
                }
              >
                {t("settings.unlink")}
              </LoadingButton>
            ) : (
              <LoadingButton
                loading={isLinkPending || isUnlinkPending}
                success={
                  [linkVariables?.id, unlinkVariables?.id].includes(
                    providerId as TBetterAuthProviders
                  )
                    ? isLinkSuccess || isUnlinkSuccess
                    : undefined
                }
                onClick={() =>
                  linkMutate({ id: providerId as TBetterAuthProviders })
                }
              >
                {t("settings.link")}
              </LoadingButton>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
