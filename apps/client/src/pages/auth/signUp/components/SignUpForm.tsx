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
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl, ROUTES, signUpAuthentificationSchemas } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.email(),
  username: z.string().min(1).max(50),
  password: z.string().min(8).max(50),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});
type TFormSchema = z.infer<typeof formSchema>;

export const SignUpForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.AUTHENTIFICATION_SIGNUP),
        schemas: signUpAuthentificationSchemas,
        data: {
          ...data,
          name: data.firstName + " " + data.lastName,
        },
      }),
    onSuccess: () => {
      toast.success(t("sign.emailVerification"));
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
            <FieldLabel htmlFor="input-email">{t("sign.email")}</FieldLabel>
            <Input
              id="email"
              placeholder={t("sign.emailExample")}
              {...form.register("email")}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <FieldGroup className="flex flex-row">
            <Field>
              <FieldLabel htmlFor="input-first-name">
                {t("sign.firstName")}
              </FieldLabel>
              <Input
                id="firstName"
                placeholder={t("sign.firstName")}
                {...form.register("firstName")}
              />
              <FieldError>
                {form.formState.errors.firstName?.message}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="input-last-name">
                {t("sign.lastName")}
              </FieldLabel>
              <Input
                id="lastName"
                placeholder={t("sign.lastName")}
                {...form.register("lastName")}
              />
              <FieldError>{form.formState.errors.lastName?.message}</FieldError>
            </Field>
          </FieldGroup>
          <Field>
            <FieldLabel htmlFor="input-username">
              {t("sign.username")}
            </FieldLabel>
            <Input
              id="username"
              placeholder={t("sign.username")}
              {...form.register("username")}
            />
            <FieldError>{form.formState.errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="input-password">
              {t("sign.password")}
            </FieldLabel>
            <InputPassword
              id="password"
              placeholder={t("sign.password")}
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
              {t("sign.up")}
            </LoadingButton>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
