import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../notFound/NotFound.page";
import { Historic } from "./components/Historic";

export const HistoricPage = () => {
  const { t } = useTranslation();
  const [isNotFound, setIsNotFound] = useState(false);

  if (isNotFound) return <NotFoundPage />;

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{t("historic.title")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Historic setIsNotFound={setIsNotFound} />
      </LayoutContent>
    </Layout>
  );
};
