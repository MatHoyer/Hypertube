import { openDialog } from "@/components/dialogs/dialog.store";
import { Button } from "@/components/ui/button";
import { useUserPlaylists } from "@/hooks/use-playlists";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Playlists } from "./components/Playlists";

export const PlaylistsPage = () => {
  const { t } = useTranslation();
  const { totalCount } = useUserPlaylists({ page: 1, pageSize: 10 });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource resource="playlists" count={totalCount} />
        <LayoutActions>
          <Button onClick={() => openDialog("playlist")}>
            <Plus />
            {t("playlist.new")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <Playlists />
      </LayoutContent>
    </Layout>
  );
};
