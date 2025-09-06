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

  const updatePicture = async (newPicture: string) => {
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

  const changeImage = async (element: ChangeEvent<HTMLInputElement>) => {
    const file = element.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosFetch({
      method: "PUT",
      url: getUrl("api-users-upload-picture"),
      schemas: {
        response: z.object({
          data: z.string().optional(),
          error: z.string().optional(),
        }),
      },
      data: formData,
      config: { headers: { "Content-Type": "multipart/form-data" } },
    });

    if (res.data) updatePicture(res.data);
  };

  return (
    <>
      <Input type="file" onChange={(element) => changeImage(element)} />
      <ImageAvatar
        imageSrc={getUrl("api-users-get-picture", {
          pictureName: user.image ?? "",
        })}
        name={user.name}
        size="lg"
      />
      <Button
        disabled={!user.image}
        type="button"
        onClick={async () => {
          await updatePicture("");
          // DELETE FILE IN THE SERVER
        }}
      >
        {t("settings.deletePicture")}
      </Button>
    </>
  );
};
