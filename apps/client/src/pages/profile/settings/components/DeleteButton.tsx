import { Button } from "@/components/ui/button";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  deleteUserAuthentificationSchemas,
  getUrl,
  ROUTES,
} from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const DeleteButton = () => {
  const { t } = useTranslation();

  const { mutate } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.DELETE_USER),
        schemas: deleteUserAuthentificationSchemas,
      }),
    onSuccess: () => {
      toast.success(t("settings.emailVerification"));
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <Button variant={"destructive"} onClick={() => mutate()}>
      {t("settings.delete")}
    </Button>
  );
};
