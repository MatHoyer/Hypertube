import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import InputPassword from "@/components/ui/input-password";
import { authClient } from "@/lib/auth-client";
import { errorCodes } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl } from "@hypertube/libs";
import { ThumbsUp, TriangleAlert } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({ password: z.string().min(8).max(50) });

export const ResetPasswordForm = () => {
  const [authMessageError, setAuthMessageError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, _] = useQueryState("token", { defaultValue: "" });
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.resetPassword(
      {
        newPassword: userData.password,
        token,
      },
      {
        onSuccess: () => {
          setAuthMessageError("");
          setResetSuccess(true);
        },
        onError: (ctx) => {
          setAuthMessageError(ctx.error.code);
          setResetSuccess(false);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("sign.password")}</FormLabel>
              <FormControl>
                <InputPassword {...field} placeholder={t("sign.password")} />
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
        {!!resetSuccess && (
          <div className={"flex text-green-500"}>
            <ThumbsUp />
            <p>{t("sign.resetSuccessMessage")}</p>
          </div>
        )}
        <div className="flex justify-between">
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl("client-signup")}>{t("sign.up")}</Link>
          </Button>
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
          </Button>
          <Button>{t("sign.resetPassword")}</Button>
        </div>
      </form>
    </Form>
  );
};
