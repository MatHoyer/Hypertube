import {
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
  typedKeys,
  type TTmdbCategory,
  type TTmdbSort,
} from "@hypertube/libs";
import { createParser } from "nuqs";
import z from "zod";

export const parseAsTmdbCategory = createParser<TTmdbCategory | null>({
  parse: (value) => {
    if (!tmdbCategories.includes(value as TTmdbCategory)) {
      return null;
    }
    return value as TTmdbCategory;
  },
  serialize: (value) => value ?? "",
});

export const parseAsTmdbSort = createParser<TTmdbSort | null>({
  parse: (value) => {
    if (!tmdbSorts.includes(value as TTmdbSort)) {
      return null;
    }
    return value as TTmdbSort;
  },
  serialize: (value) => value ?? "",
});

export const tmdbGenresSchema = z.array(z.enum(typedKeys(tmdbGenres)));
