import { ImageAvatar } from "@/components/images/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequiredUser } from "@/hooks/use-required-user";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getUrl } from "@hypertube/libs";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

export const ProfilePictureUpdate = () => {
  const user = useRequiredUser();
  const { t } = useTranslation();

  const deleteProfilePicture = async () => {
    await fetch(
      getUrl("api-image-delete", {
        imageId: user.image ?? "",
      })
    );
  };

  const updateProfilePicture = async (imageId: string) => {
    await deleteProfilePicture();
    void imageId;
    await authClient.updateUser(
      {
        image: imageId,
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

  const uploadProfilePicture = async (
    element: ChangeEvent<HTMLInputElement>
  ) => {
    const file = element.currentTarget.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosFetch({
        method: "POST",
        url: getUrl("api-image-upload"),
        schemas: {
          response: z.object({
            data: z.string().optional(),
            error: z.string().optional(),
          }),
        },
        data: formData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
      });
      if (res.data) updateProfilePicture(res.data);
      else throw new Error(res.error);
    } catch {
      toast.error(t("settings.updatePictureFailed"));
    }
  };

  return (
    <>
      <Input
        type="file"
        onChange={(element) => uploadProfilePicture(element)}
      />
      <ImageAvatar
        imageSrc={getUrl("api-image-get", {
          imageId: user.image ?? "",
        })}
        name={user.name}
      />
      <Button
        disabled={!user.image}
        type="button"
        onClick={async () => {
          await updateProfilePicture(".");
        }}
      >
        {t("settings.deletePicture")}
      </Button>
    </>
  );
};
