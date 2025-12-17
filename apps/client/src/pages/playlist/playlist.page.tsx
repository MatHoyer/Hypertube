import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { useConvertParams } from "@/hooks/use-convert-params";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

const playlistPageSize = 10;

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);
  const [page, _] = useQueryState("page", parseAsInteger.withDefault(1));

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
    placeholderData: (previousData) => previousData,
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource
          resource="playlist"
          count={data?.totalCount ?? 0}
          dynamicTitle={data?.name}
        />
      </LayoutHeader>
      <LayoutContent>
        {data && (
          <Playlist
            playlistPage={data}
            playlistPageSize={playlistPageSize}
            playlistId={playlistId}
          />
        )}
        {isLoading && <LoadingResource resource="playlist" />}
        {isError && <ErrorResource resource="playlist" />}
      </LayoutContent>
    </Layout>
  );
};
