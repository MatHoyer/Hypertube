import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { useTranslation } from "react-i18next";
import { Playlists } from "./components/Playlists";

export const PlaylistsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{t("playlist.title")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Playlists />
      </LayoutContent>
    </Layout>
  );
};
