import { LoadingPage } from "@/components/LoadingPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequiredUser } from "@/hooks/use-required-user";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const UpdateInfo: React.FC<ComponentProps<"div">> = ({ ...props }) => {
  const { user, isLoading, isError } = useRequiredUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const emailMutation = useMutation({
    mutationFn: (newEmail: string) => {
      return authClient.changeEmail(
        { newEmail: newEmail },
        {
          onSuccess: () => {
            toast.success(t("settings.updateEmailMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const namesMutation = useMutation({
    mutationFn: (names: { firstName?: string; lastName?: string }) => {
      return authClient.updateUser(
        {
          ...(names.firstName && { firstName: names.firstName }),
          ...(names.lastName && { lastName: names.lastName }),
        },
        {
          onSuccess: () => {
            toast.success(t("settings.updateInfoMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  if (isLoading) return <LoadingPage resource="global" />;
  if (isError || !user) return <></>;

  return (
    <div {...props}>
      <Label htmlFor="input-email">{t("sign.email")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value !== user.email)
            emailMutation.mutate(e.target.value);
        }}
        defaultValue={user.email}
        type="email"
        id="input-email"
      />
      <Label htmlFor="input-first-name">{t("sign.firstName")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value !== user.firstName)
            namesMutation.mutate({ firstName: e.target.value });
        }}
        defaultValue={user.firstName}
      />
      <Label htmlFor="input-last-name">{t("sign.lastName")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value !== user.lastName)
            namesMutation.mutate({ lastName: e.target.value });
        }}
        defaultValue={user.lastName}
      />
    </div>
  );
};
