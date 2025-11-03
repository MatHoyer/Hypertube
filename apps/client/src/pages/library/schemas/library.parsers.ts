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

export const parseAsTmdbCategory = createParser<TTmdbCategory>({
  parse: (value) => {
    if (!tmdbCategories.includes(value as NonNullable<TTmdbCategory>)) {
      return null;
    }
    return value as TTmdbCategory;
  },
  serialize: (value) => value ?? "",
});

export const parseAsTmdbSort = createParser<TTmdbSort>({
  parse: (value) => {
    if (!tmdbSorts.includes(value as NonNullable<TTmdbSort>)) {
      return null;
    }
    return value as TTmdbSort;
  },
  serialize: (value) => value ?? "",
});

export const tmdbGenresSchema = z.array(z.enum(typedKeys(tmdbGenres)));
