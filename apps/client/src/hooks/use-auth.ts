import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getSessionUsersSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.USERS_SESSION),
        schemas: getSessionUsersSchemas,
      }),
    retry: false,
  });

  return {
    user: query.data?.data?.user,
    session: query.data?.data?.session,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
