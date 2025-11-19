import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { getCredentialsSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { OathCredential } from "./components/oath-credential";
import { OAuthCredentialsActions } from "./components/oauth-credentials-actions";
import { OAuthCredentialsEmpty } from "./components/oauth-credentials-empty";

export const OAuthCredentialsPage = () => {
  const { t } = useTranslation();

  const { data: credentials } = useQuery({
    queryKey: getQueryKey(ROUTES.API.OAUTH_CREDENTIALS),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.OAUTH_CREDENTIALS),
        schemas: getCredentialsSchemas,
      }),
  });

  return (
    <Layout size="lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials?.map((credential) => (
              <OathCredential key={credential.id} credential={credential} />
            ))}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
};
