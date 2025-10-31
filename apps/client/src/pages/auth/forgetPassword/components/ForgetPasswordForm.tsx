import { LoadingButton } from "@/components/LoadingButton";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getUrl,
  requestPasswordResetAuthentificationSchemas,
} from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({ email: z.email() });
type TFormSchema = z.infer<typeof formSchema>;

export const ForgetPasswordForm = () => {
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-authentification-request-password-reset"),
        schemas: requestPasswordResetAuthentificationSchemas,
        data,
      }),
    onSuccess: () => {
      toast.success(t("sign.resetPasswordEmail"));
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
            <FieldLabel htmlFor="input-email">{t("sign.email")}</FieldLabel>
            <Input
              id="email"
              placeholder={t("sign.emailExample")}
              {...form.register("email")}
            />
            <FieldDescription>{t("sign.forgetPasswordDesc")}</FieldDescription>
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <Field>
            <LoadingButton
              type="submit"
              loading={isPending}
              success={isSuccess}
            >
              {t("sign.sendEmail")}
            </LoadingButton>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
