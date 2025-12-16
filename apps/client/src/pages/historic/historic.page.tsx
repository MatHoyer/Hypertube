import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getHistorySchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Historic } from "./components/Historic";

export const HistoricPage = () => {
  const { data } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page: 1 }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: {
            page: "1",
            pageSize: "10",
          },
        }),
        schemas: getHistorySchemas,
      }),
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource
          resource="historic"
          count={data?.totalCount ?? 0}
        />
      </LayoutHeader>
      <LayoutContent>
        <Historic />
      </LayoutContent>
    </Layout>
  );
};
