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
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl } from "@hypertube/libs";
import { type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({ email: z.email() });

export const ForgetPasswordForm: React.FC<ComponentProps<"div">> = ({
  ...props
}) => {
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
        onError: (ctx) => {
          toast.error(betterAuthTranslation(t, ctx.error.code));
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
          <Button type="submit" className="w-full">
            {t("sign.sendEmail")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
