import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { PagePagination } from "@/components/Pagination";
import { FloatingBar } from "@/components/ui/FloatingBar";
import { useConvertParams } from "@/hooks/use-convert-params";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

const playlistPageSize = 10;

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [totalCount, setTotalCount] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, {
      playlistId,
      page,
    }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          playlistId,
          searchParams: {
            page: page.toString(),
            pageSize: playlistPageSize.toString(),
          },
        }),
        schemas: getPlaylistSchemas,
      }),
  });

  useEffect(() => {
    if (data) setTotalCount(data.totalCount);
  }, [data, setTotalCount]);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource
          resource="playlist"
          count={totalCount}
          dynamicTitle={data?.name}
        />
      </LayoutHeader>
      <LayoutContent>
        {data && <Playlist movies={data.movies} playlistId={playlistId} />}
        {isLoading && <LoadingResource resource="playlist" />}
        {isError && <ErrorResource resource="playlist" />}
        {totalCount > playlistPageSize && (
          <FloatingBar>
            <PagePagination
              page={page}
              setPage={(value) => {
                setPage(value);
                scrollTo({ top: 0, behavior: "smooth" });
              }}
              maxPage={Math.ceil(totalCount / playlistPageSize)}
            />
          </FloatingBar>
        )}
      </LayoutContent>
    </Layout>
  );
};
