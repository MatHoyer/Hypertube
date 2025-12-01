import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { useTranslation } from "react-i18next";
import { Historic } from "./components/Historic";

export const HistoricPage = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{t("navbar.historic")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Historic />
      </LayoutContent>
    </Layout>
  );
};
