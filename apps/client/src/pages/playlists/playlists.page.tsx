import { useScrollArea } from "@/components/contexts/scroll-area/scroll-area.context";
import { openDialog } from "@/components/dialogs/dialog.store";
import { ErrorResource } from "@/components/ErrorResource";
import { FloatingPagePagination } from "@/components/FloatingPagePagination";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { Playlists } from "./components/Playlists";

const playlistsPageSize = 10;

export const PlaylistsPage = () => {
  const { scrollTo } = useScrollArea();
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, isPlaceholderData, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          searchParams: {
            page,
            pageSize: playlistsPageSize,
          },
        }),
        schemas: getPlaylistsSchemas,
      }),
    placeholderData: (previousData) => previousData,
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource resource="playlists" count={data?.total ?? 0} />
        <LayoutActions>
          <Button onClick={() => openDialog("playlist")}>
            <Plus />
            {t("playlist.new")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        {data && !isPlaceholderData && <Playlists playlists={data.playlists} />}
        {(isLoading || isPlaceholderData) && (
          <LoadingResource resource="playlists" />
        )}
        {isError && <ErrorResource resource="playlists" />}
        <FloatingPagePagination
          page={page}
          setPage={(value) => {
            setPage(value);
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          maxPage={data?.totalPages ?? 0}
        />
      </LayoutContent>
    </Layout>
  );
};
