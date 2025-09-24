import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getUrl, patchUsersSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const UserInfoUpdate = () => {
  const user = useRequiredUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const patchMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }) => {
      await axiosFetch({
        method: "PATCH",
        url: getUrl("api-users", { userId: user.id }),
        schemas: patchUsersSchemas,
        data: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
      toast.success(t("settings.updateInfo"));
    },
    onError: () => {
      toast.error(t("settings.updateInfoFailed"));
    },
  });

  return (
    <div className="flex flex-col w-full gap-2">
      <Label htmlFor="input-email">{t("sign.email")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value && e.target.value !== user.email)
            patchMutation.mutate({ email: e.target.value });
        }}
        defaultValue={user.email}
        type="email"
        id="input-email"
      />
      <Label htmlFor="input-full-name">{t("settings.displayName")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value && e.target.value !== user.name)
            patchMutation.mutate({ name: e.target.value });
        }}
        defaultValue={user.name}
      />
      <Label htmlFor="input-first-name">{t("sign.firstName")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value && e.target.value !== user.firstName)
            patchMutation.mutate({ firstName: e.target.value });
        }}
        defaultValue={user.firstName}
      />
      <Label htmlFor="input-last-name">{t("sign.lastName")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value && e.target.value !== user.lastName)
            patchMutation.mutate({ lastName: e.target.value });
        }}
        defaultValue={user.lastName}
      />
    </div>
  );
};
