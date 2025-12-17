import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getHistorySchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { Historic } from "./components/Historic";

const defaultPage = 1;
const pageSize = 10;

export const HistoricPage = () => {
  const { data } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page: defaultPage }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: {
            page: defaultPage.toString(),
            pageSize: pageSize.toString(),
          },
        }),
        schemas: getHistorySchemas,
      }),
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutHeaderResource
          resource="historic"
          count={data?.totalCount ?? 0}
        />
      </LayoutHeader>
      <LayoutContent>
        <Historic pageSize={pageSize} />
      </LayoutContent>
    </Layout>
  );
};
