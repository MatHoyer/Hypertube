import { tmdbGenres } from "@hypertube/libs";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";
import { createContext, useContext } from "react";

type TLibraryContext = {
  query: string;
  setQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filters: string[];
  setFilters: (value: string[] | ((old: string[]) => string[])) => void;
};

const LibraryContext = createContext<TLibraryContext | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "" });
  const [filters, setFilters] = useQueryState(
    "filter",
    parseAsArrayOf(
      parseAsStringLiteral(Object.keys(tmdbGenres).map((name) => name))
    ).withDefault([])
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
