import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getCredentialsSchemas, getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { OAuthCredentialsActions } from "./components/oauth-credentials-actions";
import { OAuthCredentialsEmpty } from "./components/oauth-credentials-empty";

export const OAuthCredentialsPage = () => {
  const { t } = useTranslation();

  const { data: credentials } = useQuery({
    queryKey: ["credentials"],
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl("api-oauth-credentials"),
        schemas: getCredentialsSchemas,
      }),
  });

  return (
    <Layout>
      <LayoutHeader className="mb-6">
        <LayoutTitle>{t("oauthCredentials.title")}</LayoutTitle>
        <LayoutDescription>
          {t("oauthCredentials.description")}
        </LayoutDescription>
        <LayoutActions className="w-full">
          <OAuthCredentialsActions />
        </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        {credentials?.length === 0 ? (
          <OAuthCredentialsEmpty />
        ) : (
          credentials?.map((credential) => (
            <div key={credential.id}>{credential.clientId}</div>
          ))
        )}
      </LayoutContent>
    </Layout>
  );
};
