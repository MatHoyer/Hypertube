import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { errorCodes } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServerUrl, getUrl } from "@hypertube/libs";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({ email: z.email() });

export const ForgetPasswordForm = () => {
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
        redirectTo: getServerUrl() + getUrl("client-reset-password"),
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("sign.email")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("sign.email")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!!authMessageError && (
          <div className={"flex text-red-500"}>
            <TriangleAlert />
            <p>
              {t(
                `better-auth-error.${authMessageError}` as (typeof errorCodes)[number]
              )}
            </p>
          </div>
        )}
        <div className="flex justify-between">
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl("client-signup")}>{t("sign.up")}</Link>
          </Button>
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
          </Button>
          <Button>{t("sign.sendEmail")}</Button>
        </div>
      </form>
    </Form>
  );
};
