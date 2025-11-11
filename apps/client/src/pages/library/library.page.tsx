import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { tmdbGenres } from "@hypertube/libs";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";
import { Filter } from "./components/Filter";
import { Library } from "./components/Library";
import { SearchCard } from "./components/SearchCard";

export const LibraryPage = () => {
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "" });
  const [filters, setFilters] = useQueryState(
    "filter",
    parseAsArrayOf(
      parseAsStringLiteral(tmdbGenres.map((genre) => genre.name))
    ).withDefault([])
  );

  void sortBy;

  return (
    <Layout size="lg">
      <LayoutContent className="flex flex-col gap-2">
        <SearchCard setQuery={setQuery} />
        <Filter
          setQuery={setQuery}
          setSortBy={setSortBy}
          filters={filters}
          setFilters={setFilters}
        />
        <Library query={query} />
      </LayoutContent>
    </Layout>
  );
};
