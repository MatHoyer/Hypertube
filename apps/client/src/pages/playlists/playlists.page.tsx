import { useConvertParams } from "@/hooks/use-convert-params";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { useTranslation } from "react-i18next";
import { Playlist } from "./components/Playlist";
import { Playlists } from "./components/Playlists";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistsPage = () => {
  const { t } = useTranslation();
  const { playlistName } = useConvertParams(PlaylistPageParamsSchema);

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>
          {playlistName ? playlistName : t("playlist.title")}
        </LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        {playlistName ? (
          <Playlist playlistName={playlistName} />
        ) : (
          <Playlists />
        )}
      </LayoutContent>
    </Layout>
  );
};
