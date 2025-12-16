import { openDialog } from "@/components/dialogs/dialog.store";
import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Playlists } from "./components/Playlists";

export const PlaylistsPage = () => {
  const { t } = useTranslation();
  const [playlistsCount, setPlaylistsCount] = useState(0);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource resource="playlists" count={playlistsCount} />
        <LayoutActions className="flex w-full justify-end">
          <Button onClick={() => openDialog("playlist")}>
            <Plus />
            {t("playlist.new")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <Playlists setPlaylistsCount={setPlaylistsCount} />
      </LayoutContent>
    </Layout>
  );
};
