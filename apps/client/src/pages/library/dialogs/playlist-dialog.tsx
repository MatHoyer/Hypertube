import { closeDialog } from "@/components/dialogs/dialog.store";
import { LoadingButton } from "@/components/LoadingButton";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUrl, postPlaylistSchemas, ROUTES } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({ playlistName: z.string().min(1) });
type TFormSchema = z.infer<typeof formSchema>;

export const PlaylistDialog = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playlistName: "",
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormSchema) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.PLAYLISTS),
        schemas: postPlaylistSchemas,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      });
      toast.success(t("playlist.creationSuccess"));
      closeDialog();
    },
    onError: () => {
      toast.error(t("playlist.creationFailed"));
    },
  });

  return (
    <DialogContent className="flex flex-col items-center">
      <DialogTitle>{t("playlist.dialog.title")}</DialogTitle>
      <DialogDescription>{t("playlist.dialog.desc")}</DialogDescription>
      <form
        className="size-full"
        onSubmit={form.handleSubmit((data) => mutate(data))}
      >
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="input-playlistName">
              {t("sign.email")}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="playlistName"
                autoFocus
                placeholder={t("playlist.dialog.placeholder")}
                {...form.register("playlistName")}
              />
            </InputGroup>
            <FieldError>
              {form.formState.errors.playlistName?.message}
            </FieldError>
          </Field>
          <Field>
            <LoadingButton
              type="submit"
              loading={isPending}
              success={isSuccess}
            >
              {t("playlist.dialog.button")}
            </LoadingButton>
          </Field>
        </FieldSet>
      </form>
    </DialogContent>
  );
};
