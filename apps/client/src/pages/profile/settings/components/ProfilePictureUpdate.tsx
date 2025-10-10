import { UserImageAvatar } from "@/components/images/Avatar";
import { LoadingButton } from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  deleteImageSchemas,
  getUrl,
  patchUsersSchemas,
  postImageSchemas,
} from "@hypertube/libs";
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
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosFetch({
        method: "POST",
        url: getUrl("api-images"),
        schemas: {
          requirements: z.instanceof(FormData),
          response: postImageSchemas.response,
        },
        data: formData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
      });

      if (res.error || !res.data)
        throw new Error(t("settings.updatePictureFailed"));

      if (user.imageId)
        await axiosFetch({
          method: "DELETE",
          url: getUrl("api-images", { imageId: user.imageId }),
          schemas: deleteImageSchemas,
        });

      await axiosFetch({
        method: "PATCH",
        url: getUrl("api-users", { userId: user.id }),
        schemas: patchUsersSchemas,
        data: { image: res.data.path, imageId: res.data.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
      toast.success(t("settings.updatePicture"));
    },
    onError: () => {
      toast.error(t("settings.updatePictureFailed"));
    },
  });

  const {
    mutate: delMutate,
    isPending: isDelPending,
    isSuccess: isDelSuccess,
  } = useMutation({
    mutationFn: async () => {
      if (user.imageId)
        await axiosFetch({
          method: "DELETE",
          url: getUrl("api-images", { imageId: user.imageId }),
          schemas: deleteImageSchemas,
        });

      await axiosFetch({
        method: "PATCH",
        url: getUrl("api-users", { userId: user.id }),
        schemas: patchUsersSchemas,
        data: { image: null, imageId: null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
      toast.success(t("settings.updatePicture"));
    },
    onError: () => {
      toast.error(t("settings.updatePictureFailed"));
    },
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <UserImageAvatar size="lg" />
      <Input
        type="file"
        className="w-full"
        onChange={(event) => {
          updateMutation.mutate(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <LoadingButton
        disabled={!user.image}
        type="button"
        className="w-full"
        loading={isDelPending}
        success={isDelSuccess}
        onClick={() => {
          delMutate();
        }}
      >
        {t("settings.deletePicture")}
      </LoadingButton>
    </div>
  );
};
