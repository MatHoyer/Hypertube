import { InfiniteVirtualizer } from "@/components/InfiniteVirtualizer";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  deleteMovieFromPlaylistSchemas,
  getPlaylistsSchemas,
  getUrl,
  postMovieToPlaylistSchemas,
  ROUTES,
  type TDeleteMovieFromPlaylistSchemas,
  type TGetMoviesSchemas,
  type TPostMovieToPlaylistSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { createContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type TPlaylistsWithMoviesSet = {
  movies: Set<number>;
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}[];

const fetchPlaylists = async ({ pageParam }: { pageParam: number }) => {
  const res = await axiosFetch({
    method: "GET",
    url: getUrl(ROUTES.API.PLAYLISTS, {
      searchParams: {
        page: pageParam,
      },
    }),
    schemas: getPlaylistsSchemas,
  });

  const data = res.playlists.map((playlist) => {
    const movies = playlist.movies.map((movie) => movie.tmdbId);
    return { ...playlist, movies: new Set(movies) };
  });

  const { playlists: _, ...paginationData } = res;
  return { data, ...paginationData };
};

const Playlist: React.FC<{
  playlist: TPlaylistsWithMoviesSet[number];
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = ({ playlist, movie }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isPlaylistHasMovie = playlist.movies.has(movie.details.id);

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
    <DropdownMenuItem
      key={playlist.id}
      className="flex w-full justify-between"
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
        className={cn(isPlaylistHasMovie && "fill-primary text-primary")}
      />
    </DropdownMenuItem>
  );
};

const ScrollContext = createContext<HTMLElement | null>(null);

export const PlaylistList: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = ({ movie }) => {
  const { t } = useTranslation();
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    setScrollElement(viewport as HTMLElement);
  }, []);

  const queryFn = ({ pageParam }: { pageParam: number }) =>
    fetchPlaylists({ pageParam });

  const queryKey = getQueryKey(ROUTES.API.PLAYLISTS);

  const virtualizerOptions = {
    getScrollElement: () => scrollElement,
    estimateSize: () => 30,
    overscan: 1,
  };

  return (
    <ScrollContext.Provider value={scrollElement}>
      <ScrollArea ref={scrollRef} className="h-36 w-[200px]">
        <InfiniteVirtualizer
          className=""
          queryFn={queryFn}
          queryKey={queryKey}
          virtualizerOptions={virtualizerOptions}
          renderChild={(playlist) => (
            <Playlist playlist={playlist} movie={movie} />
          )}
          emptyChild={
            <DropdownMenuItem className="flex justify-center" disabled>
              {t("playlist.none")}
            </DropdownMenuItem>
          }
        />
      </ScrollArea>
    </ScrollContext.Provider>
  );
};
