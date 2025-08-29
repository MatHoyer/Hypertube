import { ErrorCard } from "@/components/ErrorCard";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import type { errorCodes } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl } from "@hypertube/libs";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({ email: z.email() });

export const ForgetPasswordForm: React.FC<ComponentProps<"div">> = ({
  ...props
}) => {
  const [authMessageError, setAuthMessageError] = useState("");
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.requestPasswordReset(
      {
        email: userData.email,
        redirectTo: getUrl("client-reset-password", { withServerUrl: true }),
      },
      {
        onSuccess: () => {
          setAuthMessageError("");
        },
        onError: (ctx) => {
          setAuthMessageError(ctx.error.code);
        },
      }
    );
  };

  return (
    <div {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sign.email")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("sign.emailExample")} />
                </FormControl>
                <FormDescription>
                  {t("sign.forgetPasswordDesc")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {!!authMessageError && (
            <ErrorCard
              title={t("global.error")}
              message={t(
                `better-auth-error.${authMessageError}` as (typeof errorCodes)[number]
              )}
            />
          )}
          <Button className="w-full">{t("sign.sendEmail")}</Button>
        </form>
      </Form>
    </div>
  );
};
