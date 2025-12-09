import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
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
import { useUserPlaylists } from "@/hooks/use-playlists";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  deleteMovieFromPlaylistSchemas,
  getUrl,
  postMovieToPlaylistSchemas,
  ROUTES,
  type TDeleteMovieFromPlaylistSchemas,
  type TGetMoviesSchemas,
  type TPostMovieToPlaylistSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, EllipsisVertical, Plus } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = memo(({ movie }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { playlists, isLoading, isError } = useUserPlaylists();
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

  const deleteMovieFromPlaylistMutation = useMutation({
    mutationFn: (data: {
      playlistId: TDeleteMovieFromPlaylistSchemas["urlParams"]["playlistId"];
      tmdbId: TDeleteMovieFromPlaylistSchemas["urlParams"]["tmdbId"];
    }) =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.PLAYLISTS_MOVIE, {
          playlistId: data.playlistId,
          tmdbId: data.tmdbId,
        }),
        schemas: deleteMovieFromPlaylistSchemas,
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

  return (
    <div>
      <Card
        className="flex gap-0 p-2 md:p-4 items-center rounded-b-none hover:bg-card/20 cursor-pointer"
        onClick={() => openDialog("movie", movie.details)}
      >
        <MovieBaseInfo movie={movie.details} posterSize="md" info="partial" />
      </Card>
      <Card className="p-2 rounded-t-none border-t-0">
        <div className="flex gap-2 w-full items-center justify-between">
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {getDownloadStateIcon(movie.downloadState)}
            </TooltipTrigger>
            <TooltipContent>
              {t(`movie.downloadPage.tooltip.${movie.downloadState}`)}
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            {movie.isSeen && (
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
                    {playlists.map((playlist) => {
                      const isPlaylistHasMovie = !!playlist.movies.find(
                        (playlistMovie) =>
                          playlistMovie.tmdbId === movie.details.id
                      );
                      return (
                        <DropdownMenuItem
                          key={playlist.id}
                          className="flex justify-between"
                          onClick={(event) => {
                            event.preventDefault();
                            if (isPlaylistHasMovie) {
                              deleteMovieFromPlaylistMutation.mutate({
                                playlistId: playlist.id,
                                tmdbId: movie.details.id,
                              });
                            } else {
                              addMovieToPlaylistMutation.mutate({
                                playlistId: playlist.id,
                                tmdbId: movie.details.id,
                              });
                            }
                          }}
                        >
                          <Typography functionnal={"truncate"} className="w-40">
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
                    {isLoading && (
                      <DropdownMenuItem
                        className="flex justify-center"
                        disabled
                      >
                        <LoadingResource resource="playlists" />
                      </DropdownMenuItem>
                    )}
                    {isError && (
                      <DropdownMenuItem
                        className="flex justify-center"
                        disabled
                      >
                        <ErrorResource resource="playlists" />
                      </DropdownMenuItem>
                    )}
                    {!isLoading && !isError && !playlists.length && (
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
                    setTimeout(() => openDialog("playlist"), 200);
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
