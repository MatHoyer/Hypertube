import {
  tmdbDefaultSort,
  type TTmdbCategory,
  type TTmdbGenresKey,
  type TTmdbSort,
} from "@hypertube/libs";
import { parseAsJson, useQueryState } from "nuqs";
import { createContext, useCallback, useContext, useEffect } from "react";
import {
  parseAsTmdbCategory,
  parseAsTmdbSort,
  tmdbGenresSchema,
} from "../schemas/library.parsers";

type TLibraryContext = {
  query: string;
  setQuery: (value: string) => void;
  category: TTmdbCategory;
  setCategory: (value: TTmdbCategory) => void;
  sort: TTmdbSort;
  setSort: (value: TTmdbSort) => void;
  genres: TTmdbGenresKey[];
  setGenres: (value: TTmdbGenresKey[]) => void;
  reset: () => void;
};

const LibraryContext = createContext<TLibraryContext | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQueryState] = useQueryState("query", { defaultValue: "" });
  const [category, setCategoryState] = useQueryState<TTmdbCategory>(
    "category",
    parseAsTmdbCategory
  );
  const [sort, setSortState] = useQueryState<TTmdbSort>(
    "sort",
    parseAsTmdbSort
  );
  const [genres, setGenresState] = useQueryState<TTmdbGenresKey[]>(
    "filter",
    parseAsJson(tmdbGenresSchema).withDefault([])
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      setCategoryState(null);
      setSortState(null);
      setGenresState([]);
    },
    [setQueryState, setCategoryState, setSortState, setGenresState]
  );

  const setCategory = useCallback(
    (value: TTmdbCategory) => {
      setCategoryState(value);
      setQueryState("");
      setSortState(null);
      setGenresState([]);
    },
    [setCategoryState, setQueryState, setSortState, setGenresState]
  );

  const setSort = useCallback(
    (value: TTmdbSort) => {
      setQueryState("");
      setCategoryState(null);
      setSortState(value);
    },
    [setQueryState, setCategoryState, setSortState]
  );

  const setGenres = useCallback(
    (value: TTmdbGenresKey[]) => {
      setQueryState("");
      setCategoryState(null);
      setGenresState(value);
    },
    [setQueryState, setCategoryState, setGenresState]
  );

  const reset = useCallback(() => {
    setQueryState("");
    setCategoryState(null);
    setSortState(null);
    setGenresState([]);
  }, [setQueryState, setCategoryState, setSortState, setGenresState]);

  useEffect(() => {
    if (!query && !category && !sort) {
      setSortState(tmdbDefaultSort);
    }
  }, [query, category, sort, setSortState]);

  return (
    <LibraryContext.Provider
      value={{
        query,
        setQuery,
        category,
        setCategory,
        sort,
        setSort,
        genres,
        setGenres,
        reset,
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
