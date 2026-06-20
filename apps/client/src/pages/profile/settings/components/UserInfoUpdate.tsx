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
import { Input } from "@/components/ui/input";
import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getUrl,
  patchUsersSchemas,
  pick,
  ROUTES,
  typedKeys,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  username: z.string().max(50),
  name: z.string().max(50),
  firstName: z.string().max(50),
  lastName: z.string().max(50),
});
type TFormSchema = z.infer<typeof formSchema>;

export const UserInfoUpdate = () => {
  const user = useRequiredUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: (user.username ?? "").toLowerCase().trim(),
      name: user.name,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (data: TFormSchema) =>
      axiosFetch({
        method: "PATCH",
        url: getUrl(ROUTES.API.USERS, { userId: user.id }),
        schemas: patchUsersSchemas,
        data,
      }),
    onSuccess: (_, newData) => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.USERS_SESSION),
      });
      form.reset(newData);
      toast.success(t("settings.updateInfo"));
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const onSubmit = (data: TFormSchema) => {
    const dirtyFieldKeys = typedKeys(form.formState.dirtyFields);
    if (dirtyFieldKeys.length) {
      mutate(pick(data, dirtyFieldKeys));
    }
  };

  return (
    <form className="size-full" onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.updateInfoTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  {t("settings.username")}
                </FieldLabel>
                <Input
                  id="username"
                  autoComplete="username"
                  {...form.register("username", {
                    setValueAs: (username: string) =>
                      username.toLowerCase().trim(),
                  })}
                />
                <FieldError>
                  {form.formState.errors.username?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">
                  {t("settings.displayName")}
                </FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  {...form.register("name")}
                />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>
              <FieldGroup className="flex md:flex-row">
                <Field>
                  <FieldLabel htmlFor="firstname">
                    {t("settings.firstName")}
                  </FieldLabel>
                  <Input
                    id="firstname"
                    autoComplete="given-name"
                    {...form.register("firstName")}
                  />
                  <FieldError>
                    {form.formState.errors.firstName?.message}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastname">
                    {t("settings.lastName")}
                  </FieldLabel>
                  <Input
                    id="lastname"
                    autoComplete="family-name"
                    {...form.register("lastName")}
                  />
                  <FieldError>
                    {form.formState.errors.lastName?.message}
                  </FieldError>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter>
          <LoadingButton
            type="submit"
            loading={isPending}
            success={isSuccess}
            disabled={!typedKeys(form.formState.dirtyFields).length}
          >
            {t("global.submit")}
          </LoadingButton>
        </CardFooter>
      </Card>
    </form>
  );
};
