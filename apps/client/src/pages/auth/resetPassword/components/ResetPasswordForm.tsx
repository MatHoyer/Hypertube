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
import { getUrl, resetPasswordAuthentificationSchemas } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({ password: z.string().min(8).max(50) });
type TFormSchema = z.infer<typeof formSchema>;

export const ResetPasswordForm = () => {
  const [token, _] = useQueryState("token", { defaultValue: "" });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (resetPassword: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-authentification-reset-password"),
        schemas: resetPasswordAuthentificationSchemas,
        data: {
          newPassword: resetPassword.password,
          token,
        },
      }),
    onSuccess: () => {
      toast.success(t("sign.resetSuccessMessage"));
      navigate(getUrl("client-signin"));
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
            <InputPassword id="password" {...form.register("password")} />
            <FieldDescription>{t("sign.resetPasswordDesc")}</FieldDescription>
            <FieldError>{form.formState.errors.password?.message}</FieldError>
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
