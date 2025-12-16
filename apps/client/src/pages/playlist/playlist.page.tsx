import { useConvertParams } from "@/hooks/use-convert-params";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getPlaylistSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistId } = useConvertParams(PlaylistPageParamsSchema);

  const { data } = useQuery({
    queryKey: getQueryKey(ROUTES.API.PLAYLISTS, { playlistId, page: 1 }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.PLAYLISTS, {
          playlistId,
          searchParams: {
            page: "1",
            pageSize: "1",
          },
        }),
        schemas: getPlaylistSchemas,
      }),
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource
          resource="playlist"
          count={data?.totalCount ?? 0}
          dynamicTitle={data?.name}
        />
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlistId={playlistId} />
      </LayoutContent>
    </Layout>
  );
};
