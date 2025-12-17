import { ErrorResource } from "@/components/ErrorResource";
import { LayoutHeaderResource } from "@/components/LayoutHeaderResource";
import { LoadingResource } from "@/components/LoadingResource";
import { Layout, LayoutContent, LayoutHeader } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getHistorySchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { Historic } from "./components/Historic";

const historicPageSize = 10;

export const HistoricPage = () => {
  const [page, _] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER, { page }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.HISTORY, {
          searchParams: {
            page: page.toString(),
            pageSize: historicPageSize.toString(),
          },
        }),
        schemas: getHistorySchemas,
      }),
    placeholderData: (previousData) => previousData,
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
        {data && !isFetching && (
          <Historic historicPage={data} historicPageSize={historicPageSize} />
        )}
        {(isLoading || isFetching) && <LoadingResource resource="historic" />}
        {isError && <ErrorResource resource="historic" />}
      </LayoutContent>
    </Layout>
  );
};
