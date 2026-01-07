import { openAlertDialog } from "@/components/dialogs/alert-dialog.store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deletePlaylistSchemas,
  getUrl,
  ROUTES,
  type TDeletePlaylistSchemas,
  type TGetPlaylistsSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListVideo, Video, X } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Playlists: React.FC<{
  playlists: TGetPlaylistsSchemas["response"]["playlists"];
}> = ({ playlists }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [_, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { mutate: deleteMutate } = useMutation({
    mutationFn: (
      playlistId: TDeletePlaylistSchemas["urlParams"]["playlistId"]
    ) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.PLAYLISTS, { playlistId }),
        schemas: deletePlaylistSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      });
      if (playlists.length === 1) setPage(1);
      toast.success(t("playlist.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("playlist.deleteFailed"));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {!!playlists.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={getUrl(ROUTES.CLIENT.PLAYLIST, {
                playlistId: playlist.id,
              })}
            >
              <Card className="flex flex-row justify-between items-center p-5 hover:bg-card/20 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Typography textSize={"lg"} textColor={"muted"}>
                    {playlist.movies.length}
                  </Typography>
                  <Video />
                </div>
                <Typography functionnal={"truncate"}>
                  {playlist.name}
                </Typography>
                <Button
                  variant={"destructive"}
                  onClick={(event) => {
                    event.preventDefault();
                    if (playlist.movies.length) {
                      openAlertDialog(() => deleteMutate(playlist.id), {
                        confirmTextToType: playlist.name,
                      });
                    } else deleteMutate(playlist.id);
                  }}
                >
                  <X />
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {!playlists.length && (
        <div className="flex justify-center items-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListVideo />
              </EmptyMedia>
              <EmptyTitle>{t("playlist.none")}</EmptyTitle>
              <EmptyDescription>
                {t("playlist.noneDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
};
