import { useUserPlaylists } from "@/hooks/use-playlists";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { Playlists } from "./components/Playlists";

export const PlaylistsPage = () => {
  const { playlists } = useUserPlaylists();

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource resource="playlists" count={playlists.length} />
      </LayoutHeader>
      <LayoutContent>
        <Playlists />
      </LayoutContent>
    </Layout>
  );
};
