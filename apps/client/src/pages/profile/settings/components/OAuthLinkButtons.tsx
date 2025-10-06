import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import {
  betterAuthTranslation,
  supportedOAuth,
} from "@/lib/better-auth/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const OAuthLinkButtons = () => {
  const { accounts } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const linkedAccounts = accounts.map((account) => account.provider);

  const unlinkMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const res = await authClient.unlinkAccount({
        providerId: providerId,
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
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 md:m-2">
        {Object.entries(supportedOAuth).map(([oAuth, params], i) => (
          <Card className="p-5" key={i}>
            <img
              src={params.img}
              draggable={false}
              alt={params.name}
              title={params.name}
            />
            {linkedAccounts.includes(oAuth) ? (
              <Button
                variant={"destructive"}
                onClick={() => unlinkMutation.mutate(oAuth)}
              >
                {t("settings.unlink")}
              </Button>
            ) : (
              <Button>{t("settings.link")}</Button>
            )}
          </Card>
        ))}
      </div>
      {!linkedAccounts.includes("credential") && (
        <Button className="mt-2 ml-10 mr-10">Credential here</Button>
      )}
    </div>
  );
};
