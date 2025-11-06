import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { useQueryState } from "nuqs";
import { Library } from "./components/Library";
import { SearchCard } from "./components/SearchCard";

export const LibraryPage = () => {
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });

  return (
    <div className="relative">
      <Layout size="lg">
        <LayoutContent className="flex flex-col gap-2">
          <SearchCard setQuery={setQuery} />
          <Library query={query} />
        </LayoutContent>
      </Layout>
    </div>
  );
};
