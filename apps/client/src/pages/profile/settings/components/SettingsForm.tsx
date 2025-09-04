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
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().optional(),
  newPassword: z.string().optional(),
});

export const UpdateInfo: React.FC<ComponentProps<"div">> = ({ ...props }) => {
  const session = authClient.useSession();
  const user = session?.data?.user;
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      password: "",
      newPassword: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    if (
      userData.firstName !== user?.firstName ||
      userData.lastName !== user?.lastName
    ) {
      await authClient.updateUser(
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.firstName + " " + userData.lastName,
        },
        {
          onSuccess: () => {
            toast.success(t("settings.updateInfoMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    }
    if (userData.email !== user?.email) {
      await authClient.changeEmail(
        {
          newEmail: userData.email,
        },
        {
          onSuccess: () => {
            toast.success(t("settings.updateEmailMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    }
    if (userData.password && userData.newPassword) {
      await authClient.changePassword(
        {
          newPassword: userData.newPassword as string,
          currentPassword: userData.password as string,
        },
        {
          onSuccess: () => {
            toast.success(t("settings.updatePasswordMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    }
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
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sign.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("sign.firstName")}
                    autoComplete="username"
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
              <FormItem>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sign.password")}</FormLabel>
                <FormControl>
                  <InputPassword
                    {...field}
                    placeholder={t("sign.password")}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.newPassword")}</FormLabel>
                <FormControl>
                  <InputPassword
                    {...field}
                    placeholder={t("settings.newPassword")}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {t("settings.updateInfo")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
