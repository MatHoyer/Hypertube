import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { tmdbGenres } from "@hypertube/libs";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";
import { Filter } from "./components/Filter";
import { Library } from "./components/Library";
import { SearchBar } from "./components/SearchBar";

export const LibraryPage = () => {
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "" });
  const [filters, setFilters] = useQueryState(
    "filter",
    parseAsArrayOf(
      parseAsStringLiteral(Object.keys(tmdbGenres).map((name) => name))
    ).withDefault([])
  );

  return (
    <Layout size="lg">
      <LayoutContent className="flex flex-col gap-2">
        <SearchBar setQuery={setQuery} />
        <Filter
          setQuery={setQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filters={filters}
          setFilters={setFilters}
        />
        <Library query={query} sortBy={sortBy} filters={filters} />
      </LayoutContent>
    </Layout>
  );
};
