import { useUserHistoric } from "@/hooks/use-historic";
import { Layout, LayoutContent } from "@/layouts/PageLayout";

export const HistoricPage = () => {
  const historic = useUserHistoric();

  return (
    <Layout>
      <LayoutContent>
        {historic.map((movie) => {
          if (movie) return <div key={movie.id}>{movie.title}</div>;
        })}
      </LayoutContent>
    </Layout>
  );
};
