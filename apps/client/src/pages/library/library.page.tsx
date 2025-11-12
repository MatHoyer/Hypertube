import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { Filter } from "./components/Filter";
import { Library } from "./components/Library";
import { LibraryProvider } from "./components/LibraryProvider";
import { SearchBar } from "./components/SearchBar";

export const LibraryPage = () => {
  return (
    <Layout size="lg">
      <LayoutContent className="flex flex-col gap-2">
        <LibraryProvider>
          <SearchBar />
          <Filter />
          <Library />
        </LibraryProvider>
      </LayoutContent>
    </Layout>
  );
};
