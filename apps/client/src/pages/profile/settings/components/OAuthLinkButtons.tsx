import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import {
  betterAuthTranslation,
  supportedOAuth,
} from "@/lib/better-auth/constants";
import { getUrl } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const OAuthLinkButtons = () => {
  const { accounts } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const linkedAccounts = accounts.map((account) => account.provider);

  const [error, setError] = useQueryState("error", { defaultValue: "" });

  useEffect(() => {
    if (error) {
      toast.error(betterAuthTranslation(t, error.toUpperCase()));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const linkMutation = useMutation({
    mutationFn: async (provider: { id: string }) => {
      const res = await authClient.linkSocial({
        provider: provider.id,
        callbackURL: getUrl("client-settings", { withServerUrl: true }),
        errorCallbackURL: getUrl("client-settings", { withServerUrl: true }),
      });
      if (res.error) throw new Error(res.error.code);
      return res;
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (provider: { id: string }) => {
      const res = await authClient.unlinkAccount({
        providerId: provider.id,
      });
      if (res.error) throw new Error(res.error.code);
      return res;
    },
    onSuccess: () => {
      toast.success(t("settings.unlinkMessage"));
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      toast.error(betterAuthTranslation(t, error.message));
    },
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 m-1">
      {Object.entries(supportedOAuth).map(([providerId, params], i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-2">
            <img
              src={params.img}
              draggable={false}
              alt={params.name}
              title={params.name}
            />
            {linkedAccounts.includes(providerId) ? (
              <Button
                variant={"destructive"}
                onClick={() => unlinkMutation.mutate({ id: providerId })}
              >
                {t("settings.unlink")}
              </Button>
            ) : (
              <Button onClick={() => linkMutation.mutate({ id: providerId })}>
                {t("settings.link")}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
