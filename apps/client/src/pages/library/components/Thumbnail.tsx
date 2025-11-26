import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Logo } from "@/components/images/Logo";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  deleteMovieToPlaylistSchemas,
  getUrl,
  postMovieToPlaylistSchemas,
  ROUTES,
  type TDeleteMovieToPlaylistSchemas,
  type TGetMoviesSchemas,
  type TGetPlaylistsSchemas,
  type TPostMovieToPlaylistSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, EllipsisVertical, Plus } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
  userPlaylists: TGetPlaylistsSchemas["response"]["playlists"];
}> = memo(({ movie, userPlaylists }) => {
  const movieSeen = true; //TODO : movieSeen by user
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const addMovieToPlaylistMutation = useMutation({
    mutationFn: (data: {
      playlistId: TPostMovieToPlaylistSchemas["urlParams"]["playlistId"];
      tmdbId: TPostMovieToPlaylistSchemas["requirements"]["tmdbId"];
    }) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.PLAYLISTS_MOVIE, {
          playlistId: data.playlistId,
        }),
        schemas: postMovieToPlaylistSchemas,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      });
      toast.success(t("playlist.addMovieSuccess"));
    },
    onError: () => {
      toast.error(t("playlist.addMovieFailed"));
    },
  });

  const deleteMovieToPlaylistMutation = useMutation({
    mutationFn: (data: {
      playlistId: TDeleteMovieToPlaylistSchemas["urlParams"]["playlistId"];
      tmdbId: TDeleteMovieToPlaylistSchemas["urlParams"]["tmdbId"];
    }) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.PLAYLISTS_MOVIE, {
          playlistId: data.playlistId,
          tmdbId: data.tmdbId,
        }),
        schemas: deleteMovieToPlaylistSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.PLAYLISTS),
      });
      toast.success(t("playlist.deleteMovieSuccess"));
    },
    onError: () => {
      toast.error(t("playlist.deleteMovieFailed"));
    },
  });

  if (!movie)
    return (
      <Card className="flex flex-col justify-center items-center">
        <Logo size="lg" />
      </Card>
    );

  return (
    <div>
      <Card
        className="flex gap-0 p-2 md:p-4 items-center rounded-b-none hover:bg-card/20 cursor-pointer"
        onClick={() => openDialog("movie", movie)}
      >
        <MovieBaseInfo movie={movie} posterSize="md" info="partial" />
      </Card>
      <Card className="p-2 rounded-t-none border-t-0">
        <div className="flex gap-2 w-full items-center justify-between">
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {getDownloadStateIcon(movie.status)}
            </TooltipTrigger>
            <TooltipContent>
              {t(`movie.downloadPage.tooltip.${movie.status}`)}
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            {movieSeen && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={"success"}>
                    <Check />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{t("movie.page.seen")}</TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <EllipsisVertical size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" side="top" align="start">
                <DropdownMenuLabel>
                  <Typography textSize="lg">{t("playlist.save")}</Typography>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <ScrollArea className="h-36">
                    {userPlaylists.map((playlist) => {
                      const isPlaylistHasMovie = !!playlist.movies.find(
                        (playlistMovie) => playlistMovie.tmdbId === movie.id
                      );
                      return (
                        <DropdownMenuItem
                          key={playlist.id}
                          className="flex justify-between"
                          onClick={() =>
                            isPlaylistHasMovie
                              ? deleteMovieToPlaylistMutation.mutate({
                                  playlistId: playlist.id,
                                  tmdbId: movie.id,
                                })
                              : addMovieToPlaylistMutation.mutate({
                                  playlistId: playlist.id,
                                  tmdbId: movie.id,
                                })
                          }
                        >
                          <Typography textSize="lg" className="truncate w-40">
                            {playlist.name}
                          </Typography>
                          <Bookmark
                            className={cn(
                              isPlaylistHasMovie && "fill-primary text-primary"
                            )}
                          />
                        </DropdownMenuItem>
                      );
                    })}
                    {!userPlaylists.length && (
                      <DropdownMenuItem
                        className="flex justify-center"
                        disabled
                      >
                        {t("playlist.none")}
                      </DropdownMenuItem>
                    )}
                  </ScrollArea>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openDialog("playlist");
                  }}
                >
                  <Plus />
                  {t("playlist.new")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
});
