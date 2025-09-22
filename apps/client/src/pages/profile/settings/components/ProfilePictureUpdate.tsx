import { UserImageAvatar } from "@/components/images/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequiredUser } from "@/hooks/use-required-user";
import { authClient } from "@/lib/auth-client";
import { betterAuthTranslation } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { deleteImageSchemas, getUrl, postImageSchemas } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

export const ProfilePictureUpdate = () => {
  const user = useRequiredUser();
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
            requirements: z.any().refine((e) => e instanceof FormData),
            response: postImageSchemas.response,
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
          imageId: encodeURIComponent(user.image ?? ""),
        }),
        schemas: deleteImageSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });

  return (
    <div className="flex">
      <div className="flex flex-col items-center gap-2">
        <UserImageAvatar size="lg" />
        <Input
          type="file"
          className="w-full"
          onChange={(event) => {
            updateMutation.mutate(event.currentTarget.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          disabled={!user.image}
          type="button"
          className="w-full"
          onClick={() => {
            deleteMutation.mutate();
          }}
        >
          {t("settings.deletePicture")}
        </Button>
      </div>
    </div>
  );
};
