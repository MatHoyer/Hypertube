import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getUrl, getUserSchemas, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { ProfilePageParamsSchema } from "./schemas/urlParams.schemas";

export const PublicProfilePage = () => {
  const { userId } = useConvertParams(ProfilePageParamsSchema);

  const { data } = useQuery({
    queryKey: getQueryKey(ROUTES.API.USERS, { userId: userId }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.USERS, { userId }),
        schemas: getUserSchemas,
      }),
  });

  return <div>{data?.user.displayUsername}</div>;
};
