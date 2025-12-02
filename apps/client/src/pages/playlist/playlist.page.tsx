import { useConvertParams } from "@/hooks/use-convert-params";
import { useUserPlaylists } from "@/hooks/use-playlists";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { NotFoundPage } from "../notFound/NotFound.page";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);
  const playlists = useUserPlaylists();

  const playlist = playlists.find((playlist) => playlist.id === playlistId);

  if (!playlist) return <NotFoundPage />;

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{playlist.name}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlist={playlist} />
      </LayoutContent>
    </Layout>
  );
};
