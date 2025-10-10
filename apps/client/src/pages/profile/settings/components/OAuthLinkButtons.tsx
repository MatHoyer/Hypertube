import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import InputPassword from "@/components/ui/input-password";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import {
  betterAuthTranslation,
  supportedOAuth,
} from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(8).max(50),
});

export const OAuthLinkButtons = () => {
  const { accounts } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const linkedAccounts = accounts.map((account) => account.provider);

  const [error, setError] = useQueryState("error", { defaultValue: "" });

  useEffect(() => {
    if (error) {
      toast.error(betterAuthTranslation(t, error.toUpperCase()));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const linkMutation = useMutation({
    mutationFn: async (provider: { id: string }) => {
      const res = await authClient.linkSocial({
        provider: provider.id,
        callbackURL: getUrl("client-settings", { withServerUrl: true }),
        errorCallbackURL: getUrl("client-settings", { withServerUrl: true }),
      });
      if (res.error) throw new Error(res.error.code);
      return res;
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (provider: { id: string }) => {
      const res = await authClient.unlinkAccount({
        providerId: provider.id,
      });
      if (res.error) throw new Error(res.error.code);
      return res;
    },
    onSuccess: () => {
      toast.success(t("settings.unlinkMessage"));
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      toast.error(betterAuthTranslation(t, error.message));
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Data :", data);
  };

  return (
    <div className="flex flex-col w-full m-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 md:m-2">
        {Object.entries(supportedOAuth).map(([providerId, params], i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2">
              <img
                src={params.img}
                draggable={false}
                alt={params.name}
                title={params.name}
              />
              {linkedAccounts.includes(providerId) ? (
                <Button
                  variant={"destructive"}
                  onClick={() => unlinkMutation.mutate({ id: providerId })}
                >
                  {t("settings.unlink")}
                </Button>
              ) : (
                <Button onClick={() => linkMutation.mutate({ id: providerId })}>
                  {t("settings.link")}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {!linkedAccounts.includes("credential") && (
        <Card className="flex md:flex-row p-2 mt-2 md:m-2">
          <form className="size-full" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
              <FieldLegend>{t("settings.credential")}</FieldLegend>
              <FieldDescription>
                {t("settings.credentialDesc")}
              </FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="input-username">
                    {t("sign.username")}
                  </FieldLabel>
                  <Input id="username" {...form.register("username")} />
                  <FieldError>
                    {form.formState.errors.username?.message &&
                      t("sign.usernamePolicy")}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="input-password">
                    {t("sign.password")}
                  </FieldLabel>
                  <InputPassword id="password" {...form.register("password")} />
                  <FieldError>
                    {form.formState.errors.password?.message &&
                      t("sign.passwordPolicy")}
                  </FieldError>
                </Field>
                <Field>
                  <Button type="submit">Submit</Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </Card>
      )}
    </div>
  );
};
