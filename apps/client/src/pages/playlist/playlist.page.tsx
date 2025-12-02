import { useConvertParams } from "@/hooks/use-convert-params";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistName } = useConvertParams(PlaylistPageParamsSchema);

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{playlistName}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlistName={playlistName} />
      </LayoutContent>
    </Layout>
  );
};
