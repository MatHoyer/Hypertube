import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
import { useConvertParams } from "@/hooks/use-convert-params";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);

  const {
    data: playlist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { playlistId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, { playlistId }),
        schemas: getPlaylistSchemas,
      }),
  });

  if (isLoading) return <LoadingResource resource="playlist" />;
  if (isError || !playlist) return <ErrorResource resource="playlist" />;

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource
          resource="playlist"
          count={playlist.totalCount}
          dynamicTitle={playlist.name}
        />
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlistId={playlistId} />
      </LayoutContent>
    </Layout>
  );
};
