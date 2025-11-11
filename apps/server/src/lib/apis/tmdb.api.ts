import {
  languageCodes,
  tmdbGenres,
  tmdbMovieSchema,
  tmdbSortBy,
  tmdbTypes,
} from "@hypertube/libs";
import { tmdbDefaultSortBy } from "@hypertube/libs/src/const/tmdb.const";
import { env } from "@hypertube/server-core";
import z from "zod";

export class TmdbApi {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly imgUrl: string;
  private readonly fetchOptions: RequestInit;

  constructor() {
    this.apiKey = env.TMDB_TOKEN;
    this.apiUrl = "https://api.themoviedb.org/3";
    this.imgUrl = "https://image.tmdb.org/t/p/original";
    this.fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    };
  }

  private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(this.apiUrl + url, {
      ...this.fetchOptions,
      ...options,
    });
    return response.json() as Promise<T>;
  }

  private async getMovieDetailsByTmdbId(
    tmdbId: number,
    language: keyof typeof languageCodes
  ) {
    const responseSchema = tmdbMovieSchema;
    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/movie/${tmdbId}?language=${language}`
    );

    response.poster_path = response.poster_path
      ? `${this.imgUrl}${response.poster_path}`
      : null;
    response.backdrop_path = response.backdrop_path
      ? `${this.imgUrl}${response.backdrop_path}`
      : null;

    return responseSchema.parse(response);
  }

  private async getAllMovieDetails(
    movieIds: number[],
    language: keyof typeof languageCodes
  ) {
    const moviePromises = movieIds.map(async (movieId) => {
      return await this.getMovieDetailsByTmdbId(movieId, language);
    });

    return await Promise.all(moviePromises);
  }

  private async getMoviesBySort({
    sortBy = tmdbDefaultSortBy,
    filters,
    page,
    language,
  }: {
    sortBy: (typeof tmdbSortBy)[number] | undefined;
    filters: string | undefined;
    page: number;
    language: keyof typeof languageCodes;
  }) {
    const responseSchema = z.object({
      page: z.number(),
      total_pages: z.number(),
      total_results: z.number(),
      results: z.array(
        z.object({
          id: z.number(),
        })
      ),
    });

    if (sortBy && tmdbTypes.includes(sortBy)) {
      const response = await this.fetch<z.infer<typeof responseSchema>>(
        `/movie/${sortBy}?page=${page}&language=${language}`
      );
      return responseSchema.parse(response);
    }

    const genres = filters
      ?.split("+")
      .map((filter) => tmdbGenres[filter as keyof typeof tmdbGenres])
      .join(",");

    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/discover/movie?language=${language}&page=${page}&sort_by=${sortBy}&with_genres=${genres}`
    );

    return responseSchema.parse(response);
  }

  private async getMoviesWithQuery({
    query,
    language,
    page,
  }: {
    query: string;
    language: keyof typeof languageCodes;
    page: number;
  }) {
    const responseSchema = z.object({
      page: z.number(),
      total_pages: z.number(),
      total_results: z.number(),
      results: z.array(
        z.object({
          id: z.number(),
        })
      ),
    });
    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/search/movie?query=${query}&language=${language}&page=${page}`
    );
    return responseSchema.parse(response);
  }

  public async getMovies({
    query,
    language,
    page,
    sortBy,
    filters,
  }: {
    query: string | undefined;
    language: keyof typeof languageCodes;
    page: number;
    sortBy: string | undefined;
    filters: string | undefined;
  }) {
    const rawMovies = query
      ? await this.getMoviesWithQuery({
          query,
          language,
          page,
        })
      : await this.getMoviesBySort({
          sortBy,
          filters,
          page,
          language,
        });

    const movies = await this.getAllMovieDetails(
      rawMovies.results.map((movie) => movie.id),
      language
    );

    return {
      movies,
      page: rawMovies.page,
      totalPages: rawMovies.total_pages,
      totalResults: rawMovies.total_results,
    };
  }

  public async getMovie(movieId: number, language: keyof typeof languageCodes) {
    return await this.getMovieDetailsByTmdbId(movieId, language);
  }
}
