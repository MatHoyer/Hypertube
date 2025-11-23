export const tmdbGenres = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
} as const;

type TTmdbGenres = typeof tmdbGenres;
export type TTmdbGenresKey = keyof TTmdbGenres;
export type TTmdbGenresValue = TTmdbGenres[keyof TTmdbGenres];

export const tmdbCategories = [
  "now_playing",
  "popular",
  "top_rated",
  "upcoming",
] as const;

export type TTmdbCategory = (typeof tmdbCategories)[number];

export const tmdbSorts = [
  "popularity.desc",
  "popularity.asc",
  "original_title.desc",
  "original_title.asc",
  "primary_release_date.desc",
  "primary_release_date.asc",
  "vote_count.desc",
  "vote_count.asc",
] as const;

export type TTmdbSort = (typeof tmdbSorts)[number];

export const tmdbDefaultSort = tmdbSorts[0];
