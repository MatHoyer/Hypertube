import { LoadingButton } from "@/components/LoadingButton";
import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { deleteUsersSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const DeleteButton = () => {
  const user = useRequiredUser();
  const { t } = useTranslation();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.USERS, { userId: user.id }),
        schemas: deleteUsersSchemas,
      }),
    onSuccess: () => {
      toast.success(t("settings.emailVerification"));
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <LoadingButton
      variant={"destructive"}
      loading={isPending}
      success={isSuccess}
      onClick={() => mutate()}
    >
      {t("settings.delete")}
    </LoadingButton>
  );
};
