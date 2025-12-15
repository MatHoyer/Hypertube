import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitleResource,
} from "@/layouts/PageLayout";
import { useState } from "react";
import { Historic } from "./components/Historic";

export const HistoricPage = () => {
  const [historicCount, setHistoricCount] = useState(0);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitleResource resource="historic" count={historicCount} />
      </LayoutHeader>
      <LayoutContent>
        <Historic setHistoricCount={setHistoricCount} />
      </LayoutContent>
    </Layout>
  );
};
