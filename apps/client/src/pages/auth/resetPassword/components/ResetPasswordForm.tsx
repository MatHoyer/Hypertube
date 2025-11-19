import { LoadingButton } from "@/components/LoadingButton";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import InputPassword from "@/components/ui/input-password";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getUrl,
  resetPasswordAuthentificationSchemas,
  ROUTES,
} from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({ newPassword: z.string().min(8).max(50) });
type TFormSchema = z.infer<typeof formSchema>;

export const ResetPasswordForm = () => {
  const [token, _] = useQueryState("token", { defaultValue: "" });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.AUTHENTIFICATION_RESET_PASSWORD),
        schemas: resetPasswordAuthentificationSchemas,
        data: {
          ...data,
          token,
        },
      }),
    onSuccess: () => {
      toast.success(t("sign.resetSuccessMessage"));
      navigate(getUrl(ROUTES.CLIENT.SIGNIN));
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <form
      className="size-full"
      onSubmit={form.handleSubmit((data) => mutate(data))}
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="input-password">
              {t("sign.password")}
            </FieldLabel>
            <InputPassword id="password" {...form.register("newPassword")} />
            <FieldDescription>{t("sign.resetPasswordDesc")}</FieldDescription>
            <FieldError>
              {form.formState.errors.newPassword?.message}
            </FieldError>
          </Field>
          <Field>
            <LoadingButton
              type="submit"
              loading={isPending}
              success={isSuccess}
            >
              {t("sign.resetPassword")}
            </LoadingButton>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
