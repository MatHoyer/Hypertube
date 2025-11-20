import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getAccountsUsersSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

export const useAuthAccounts = () => {
  const query = useQuery({
    queryKey: getQueryKey(ROUTES.API.USERS_ACCOUNTS),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.USERS_ACCOUNTS),
        schemas: getAccountsUsersSchemas,
      }),
    retry: false,
  });

  return {
    accounts: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
