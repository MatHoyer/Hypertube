import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { tmdbGenres } from "@hypertube/libs";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";
import { createContext } from "react";
import { Filter } from "./components/Filter";
import { Library } from "./components/Library";
import { SearchBar } from "./components/SearchBar";

type TLibraryContext = {
  query: string;
  setQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filters: string[];
  setFilters: (value: string[] | ((old: string[]) => string[])) => void;
};

export const LibraryContext = createContext<TLibraryContext>({
  query: "",
  setQuery: () => Promise<URLSearchParams>,
  sortBy: "",
  setSortBy: () => Promise<URLSearchParams>,
  filters: [],
  setFilters: () => Promise<URLSearchParams>,
});

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
        <LibraryContext.Provider
          value={{
            query,
            setQuery,
            sortBy,
            setSortBy,
            filters,
            setFilters,
          }}
        >
          <SearchBar />
          <Filter />
          <Library />
        </LibraryContext.Provider>
      </LayoutContent>
    </Layout>
  );
};
