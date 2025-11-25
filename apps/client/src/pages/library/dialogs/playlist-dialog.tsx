import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getUrl,
  postPlaylistSchemas,
  ROUTES,
  type TPostPlaylistSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const PlaylistDialog = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [playlistName, setPlaylistName] = useState("");

  const { mutate } = useMutation({
    mutationFn: (data: {
      playlistName: TPostPlaylistSchemas["requirements"]["playlistName"];
    }) =>
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
    },
    onError: () => {
      toast.error(t("playlist.creationFailed"));
    },
  });

  return (
    <DialogContent className="flex flex-col items-center">
      <DialogTitle>{t("playlist.dialog.title")}</DialogTitle>
      <DialogDescription>{t("playlist.dialog.desc")}</DialogDescription>
      <InputGroup>
        <InputGroupInput
          placeholder={t("playlist.dialog.placeholder")}
          onChange={({ currentTarget }) => setPlaylistName(currentTarget.value)}
        />
      </InputGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button onClick={() => mutate({ playlistName })}>
            {t("playlist.dialog.button")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
