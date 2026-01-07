import { LoadingButton } from "@/components/LoadingButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import InputPassword from "@/components/ui/input-password";
import { Typography } from "@/components/ui/typography";
import { useAuthAccounts } from "@/hooks/use-auth-accounts";
import { useRequiredUser } from "@/hooks/use-required-user";
import { credentialId } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl, patchUsersSchemas, ROUTES } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  password: z.string().min(8).max(50),
  oldPassword: z.string().min(8).max(50).optional(),
});
type TFormSchema = z.infer<typeof formSchema>;

export const UserPasswordUpdate = () => {
  const user = useRequiredUser();
  const { accounts } = useAuthAccounts();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      oldPassword: undefined,
    },
  });

  const hasCredential = useMemo(
    () => accounts.map((account) => account.provider).includes(credentialId),
    [accounts]
  );

  const needBlur = useMemo(() => !user.username, [user.username]);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "PATCH",
        url: getUrl(ROUTES.API.USERS, { userId: user.id }),
        schemas: patchUsersSchemas,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.USERS_SESSION),
      });
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.USERS_ACCOUNTS),
      });
      form.reset();
      toast.success(t("settings.updateInfo"));
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
      <Card>
        <CardHeader>
          <CardTitle>
            {hasCredential
              ? t("settings.updatePasswordTitle")
              : t("settings.setPasswordTitle")}
          </CardTitle>
        </CardHeader>
        <div className="relative">
          {needBlur && (
            <div className="flex absolute inset-0 justify-center items-center text-destructive">
              <Typography textSize="lg">
                {t("settings.usernameRequired")}
              </Typography>
            </div>
          )}
          <div
            className={cn(
              "flex flex-col gap-6",
              needBlur && "blur-xs pointer-events-none"
            )}
          >
            <CardContent>
              <FieldSet>
                <FieldGroup className="flex md:flex-row">
                  {hasCredential && (
                    <Field>
                      {/* Prevent warning about password without username field */}
                      <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        value={user.username || ""}
                        readOnly
                        hidden
                      />
                      <FieldLabel htmlFor="oldPassword">
                        {t("settings.oldPassword")}
                      </FieldLabel>
                      <InputPassword
                        id="oldPassword"
                        {...form.register("oldPassword")}
                        autoComplete="current-password"
                      />
                      <FieldError>
                        {form.formState.errors.oldPassword?.message}
                      </FieldError>
                    </Field>
                  )}
                  <Field>
                    {/* Prevent warning about password without username field */}
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={user.username || ""}
                      readOnly
                      hidden
                    />
                    <FieldLabel htmlFor="password">
                      {t("settings.newPassword")}
                    </FieldLabel>
                    <InputPassword
                      id="password"
                      {...form.register("password")}
                      autoComplete="new-password"
                    />
                    <FieldError>
                      {form.formState.errors.password?.message}
                    </FieldError>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
            <CardFooter>
              <LoadingButton
                type="submit"
                loading={isPending}
                success={isSuccess}
              >
                {t("global.submit")}
              </LoadingButton>
            </CardFooter>
          </div>
        </div>
      </Card>
    </form>
  );
};
