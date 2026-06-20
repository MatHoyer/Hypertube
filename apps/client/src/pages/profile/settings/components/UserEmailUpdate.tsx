import { LoadingButton } from "@/components/LoadingButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl, patchUsersSchemas, ROUTES } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  email: z.email(),
});
type TFormSchema = z.infer<typeof formSchema>;

export const UserEmailUpdate = () => {
  const user = useRequiredUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email.toLowerCase().trim(),
    },
  });

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
      toast.success(t("settings.emailVerification"));
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <form
      className="size-full"
      onSubmit={form.handleSubmit((data) => {
        if (form.formState.dirtyFields.email) return mutate(data);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.emailTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <Field>
              <FieldLabel htmlFor="email">{t("settings.email")}</FieldLabel>
              <Input
                id="email"
                autoComplete="email"
                {...form.register("email", {
                  setValueAs: (email: string) => email.toLowerCase().trim(),
                })}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
          </FieldSet>
        </CardContent>
        <CardFooter>
          <LoadingButton
            type="submit"
            loading={isPending}
            success={isSuccess}
            disabled={!form.formState.dirtyFields.email}
          >
            {t("global.submit")}
          </LoadingButton>
        </CardFooter>
      </Card>
    </form>
  );
};
