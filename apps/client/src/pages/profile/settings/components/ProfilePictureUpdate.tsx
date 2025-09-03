import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const ProfilePictureUpdate = () => {
  const session = authClient.useSession();
  const user = session?.data?.user;
  const { t } = useTranslation();

  const updatePicture = async (newPicture: string | null) => {
    await authClient.updateUser(
      {
        image: newPicture,
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
  };

  const changeImage = (element: ChangeEvent<HTMLInputElement>) => {
    const file = element.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await updatePicture(reader.result?.toString() || null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Input type="file" onChange={(element) => changeImage(element)} />
      <img
        className="size-50"
        src={user?.image || "/images/default_user_picture.webp"}
      ></img>
      <Button
        disabled={!user?.image}
        type="button"
        onClick={async () => {
          await updatePicture(null);
        }}
      >
        {t("settings.deletePicture")}
      </Button>
    </div>
  );
};
