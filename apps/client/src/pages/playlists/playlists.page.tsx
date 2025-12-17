import { openDialog } from "@/components/dialogs/dialog.store";
import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { PagePagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { FloatingBar } from "@/components/ui/FloatingBar";
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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Playlists } from "./components/Playlists";

const playlistsPageSize = 10;

export const PlaylistsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [totalCount, setTotalCount] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          searchParams: {
            page: page.toString(),
            pageSize: playlistsPageSize.toString(),
          },
        }),
        schemas: getPlaylistsSchemas,
      }),
  });

  useEffect(() => {
    if (data) setTotalCount(data.totalCount);
  }, [data, setTotalCount]);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource resource="playlists" count={totalCount} />
        <LayoutActions>
          <Button onClick={() => openDialog("playlist")}>
            <Plus />
            {t("playlist.new")}
          </Button>
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        {data && <Playlists playlists={data.playlists} />}
        {isLoading && <LoadingResource resource="playlists" />}
        {isError && <ErrorResource resource="playlists" />}
        {totalCount > playlistsPageSize && (
          <FloatingBar>
            <PagePagination
              page={page}
              setPage={(value) => {
                setPage(value);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              maxPage={Math.ceil(totalCount / playlistsPageSize)}
            />
          </FloatingBar>
        )}
      </LayoutContent>
    </Layout>
  );
};
