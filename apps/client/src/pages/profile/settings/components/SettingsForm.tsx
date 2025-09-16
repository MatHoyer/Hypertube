import { LoadingPage } from "@/components/LoadingPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequiredUser } from "@/hooks/use-required-user";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const UpdateInfo: React.FC<ComponentProps<"div">> = ({ ...props }) => {
  const { user, isLoading, isError } = useRequiredUser();
  const [names, setNames] = useState({ first: "", last: "" });
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const { t } = useTranslation();

  const emailMutation = useMutation({
    mutationFn: (newEmail: string) => {
      return authClient.changeEmail(
        { newEmail: newEmail },
        {
          onSuccess: () => {
            toast.success(t("settings.updateEmailMessage"));
          },
          onError: (ctx) => {
            toast.error(betterAuthTranslation(t, ctx.error.code));
          },
        }
      );
    },
  });

  const nameMutation = useMutation({
    mutationFn: (name: { firstName: string; lastName: string }) => {
      return authClient.updateUser(
        {
          firstName: name.firstName,
          lastName: name.lastName,
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
    },
  });

  if (isLoading) return <LoadingPage resource="global" />;
  if (isError || !user) return <NotFoundPage />;

  setNames({ first: user.firstName, last: user.lastName });

  return (
    <div {...props}>
      <Label htmlFor="input-email">{t("sign.email")}</Label>
      <Input
        onBlur={(e) => {
          if (e.target.value !== user.email)
            emailMutation.mutate(e.target.value);
        }}
        defaultValue={user.email}
        type="email"
        id="input-email"
      />
      <div
        onBlur={(e) => {
          if (
            e.relatedTarget !== firstNameRef.current &&
            e.relatedTarget !== lastNameRef.current &&
            (names.first !== user.firstName || names.last !== user.lastName)
          ) {
            nameMutation.mutate({
              firstName: names.first,
              lastName: names.last,
            });
          }
        }}
      >
        <Label htmlFor="input-first-name">{t("sign.firstName")}</Label>
        <Input
          ref={firstNameRef}
          onChange={(e) => {
            setNames((prev) => ({ ...prev, first: e.target.value }));
          }}
          defaultValue={user.firstName}
          id="input-first-name"
        />
        <Label htmlFor="input-last-name">{t("sign.lastName")}</Label>
        <Input
          ref={lastNameRef}
          onChange={(e) => {
            setNames((prev) => ({ ...prev, last: e.target.value }));
          }}
          defaultValue={user.lastName}
          id="input-last-name"
        />
      </div>
    </div>
  );
};
