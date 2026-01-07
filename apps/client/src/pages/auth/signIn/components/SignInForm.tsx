import { LoadingButton } from "@/components/LoadingButton";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import InputPassword from "@/components/ui/input-password";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl, ROUTES, signInAuthentificationSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
type TFormSchema = z.infer<typeof formSchema>;

export const SignInForm = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.AUTHENTIFICATION_SIGNIN),
        schemas: signInAuthentificationSchemas,
        data,
      }),
    onSuccess: () => {
      toast.success(t("sign.connexion"));
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.USERS_SESSION),
      });
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
            <FieldLabel htmlFor="username">{t("sign.username")}</FieldLabel>
            <Input
              id="username"
              autoComplete="username"
              {...form.register("username")}
            />
            <FieldError>{form.formState.errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">{t("sign.password")}</FieldLabel>
            <InputPassword
              id="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </Field>
          <Field>
            <LoadingButton
              type="submit"
              loading={isPending}
              success={isSuccess}
            >
              {t("sign.in")}
            </LoadingButton>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
