import { tmdbDefaultSortBy, tmdbGenres, tmdbSortBy } from "@hypertube/libs";
import { createParser, useQueryState } from "nuqs";
import { createContext, useContext } from "react";

type TLibraryContext = {
  query: string;
  setQuery: (value: string) => void;
  sortBy: (typeof tmdbSortBy)[number];
  setSortBy: (value: (typeof tmdbSortBy)[number]) => void;
  filters: (keyof typeof tmdbGenres)[];
  setFilters: (
    value:
      | (keyof typeof tmdbGenres)[]
      | ((old: (keyof typeof tmdbGenres)[]) => (keyof typeof tmdbGenres)[])
  ) => void;
};

const LibraryContext = createContext<TLibraryContext | undefined>(undefined);

const parseAsTmdbSortBy = createParser<(typeof tmdbSortBy)[number]>({
  parse: (value) => {
    if (!tmdbSortBy.includes(value as (typeof tmdbSortBy)[number])) {
      return null;
    }
    return value as (typeof tmdbSortBy)[number];
  },
  serialize: (value) => value,
});

export const parseAsTmdbGenres = createParser<(keyof typeof tmdbGenres)[]>({
  parse: (value) => {
    if (!Object.keys(tmdbGenres).includes(value as keyof typeof tmdbGenres)) {
      return null;
    }
    return [value as keyof typeof tmdbGenres];
  },
  serialize: (value) => value.join("+"),
});

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const [sortBy, setSortBy] = useQueryState<(typeof tmdbSortBy)[number]>(
    "sortBy",
    parseAsTmdbSortBy.withDefault(tmdbDefaultSortBy)
  );
  const [filters, setFilters] = useQueryState<(keyof typeof tmdbGenres)[]>(
    "filter",
    parseAsTmdbGenres.withDefault([])
  );

  return (
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
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within a LibraryProvider");
  return ctx;
};
