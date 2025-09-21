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
import InputPassword from "@/components/ui/input-password";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl } from "@hypertube/libs";
import { useQueryState } from "nuqs";
import { type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({ password: z.string().min(8).max(50) });

export const ResetPasswordForm: React.FC<ComponentProps<"div">> = ({
  ...props
}) => {
  const [token, _] = useQueryState("token", { defaultValue: "" });
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          toast.success(t("sign.resetSuccessMessage"));
          navigate(getUrl("client-signin"));
        },
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sign.password")}</FormLabel>
                <FormControl>
                  <InputPassword {...field} placeholder={t("sign.password")} />
                </FormControl>
                <FormDescription>{t("sign.resetPasswordDesc")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {t("sign.resetPassword")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
