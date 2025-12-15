import { ErrorResource } from "@/components/ErrorResource";
import { LoadingResource } from "@/components/LoadingResource";
import { useConvertParams } from "@/hooks/use-convert-params";
import { useUserPlaylists } from "@/hooks/use-playlists";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { NotFoundPage } from "../notFound/NotFound.page";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);
  const { playlists, isLoading, isError } = useUserPlaylists();

  if (isLoading) return <LoadingResource resource="playlists" />;
  if (isError) return <ErrorResource resource="playlists" />;

  const playlist = playlists.find((playlist) => playlist.id === playlistId);

  if (!playlist) return <NotFoundPage />;

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource
          resource="playlist"
          count={playlist.movies.length}
          dynamicTitle={playlist.name}
        />
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlist={playlist} />
      </LayoutContent>
    </Layout>
  );
};
