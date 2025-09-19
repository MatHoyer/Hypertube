import { ImageAvatar } from "@/components/images/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequiredAuth } from "@/hooks/use-required-auth";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getUrl } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

export const ProfilePictureUpdate = () => {
  const { data } = useRequiredAuth();
  const user = data!.user;

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const updateMutation = useMutation({
    mutationFn: async (file: File | undefined) => {
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axiosFetch({
          method: "POST",
          url: getUrl("api-image"),
          schemas: {
            response: z.object({
              data: z.string().optional(),
              error: z.string().optional(),
            }),
          },
          data: formData,
          config: { headers: { "Content-Type": "multipart/form-data" } },
        });

        if (res.error || !res.data) throw new Error();

        await authClient.updateUser(
          { image: res.data },
          {
            onSuccess: () => {
              toast.success(t("settings.updateInfoMessage"));
            },
            onError: (ctx) => {
              toast.error(betterAuthTranslation(t, ctx.error.code));
            },
          }
        );
      } catch {
        toast.error(t("settings.updatePictureFailed"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () =>
      await axiosFetch({
        method: "DELETE",
        url: getUrl("api-image", {
          imageId: user!.image ?? "",
        }),
        schemas: {
          response: z.object({
            data: z.string().optional(),
            error: z.string().optional(),
          }),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });

  if (!user) return;

  return (
    <>
      <Input
        type="file"
        onChange={(event) => {
          updateMutation.mutate(event.currentTarget.files?.[0]);
        }}
      />
      <ImageAvatar
        imageSrc={getUrl("api-image", {
          imageId: user.image ?? "",
        })}
        name={user.name}
      />
      <Button
        disabled={!user.image}
        type="button"
        onClick={() => {
          deleteMutation.mutate();
        }}
      >
        {t("settings.deletePicture")}
      </Button>
    </>
  );
};
