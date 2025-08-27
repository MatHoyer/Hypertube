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
import { getUrl } from "@hypertube/libs";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";
import { OAuthButtons } from "../../OAuthButtons";

const formSchema = z.object({
  email: z.email(),
  username: z.string().min(1).max(50),
  password: z.string().min(8).max(50),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const SignUpForm = () => {
  const [authMessageError, setAuthMessageError] = useState("");
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.signUp.email(
      {
        email: userData.email,
        username: userData.username,
        name: userData.firstName + " " + userData.lastName,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("sign.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("sign.email")}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-start w-full">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("sign.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("sign.firstName")}
                    autoComplete="given-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("sign.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("sign.lastName")}
                    autoComplete="family-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
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
            <FormItem className="w-full">
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
        <OAuthButtons />
        <div className="flex justify-between">
          <Button type="button" variant={"link"} asChild>
            <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
          </Button>
          <Button type="submit">{t("sign.up")}</Button>
        </div>
      </form>
    </Form>
  );
};
