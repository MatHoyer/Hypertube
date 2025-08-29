import { ErrorCard } from "@/components/ErrorCard";
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
import InputPassword from "@/components/ui/input-password";
import { authClient } from "@/lib/auth-client";
import type { errorCodes } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const SignInForm: React.FC<ComponentProps<"div">> = ({ ...props }) => {
  const [authMessageError, setAuthMessageError] = useState("");
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.signIn.username(
      {
        username: userData.username,
        password: userData.password,
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sign.username")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("sign.username")}
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <ErrorCard
              title={t("global.error")}
              message={t(
                `better-auth-error.${authMessageError}` as (typeof errorCodes)[number]
              )}
            />
          )}
          <Button type="submit" className="w-full">
            {t("sign.in")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
