import {
  languageCodes,
  tmdbDefaultSort,
  tmdbMovieSchema,
  TTmdbCategory,
  TTmdbGenresValue,
  TTmdbSort,
} from "@hypertube/libs";
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
    this.imgUrl = "https://image.tmdb.org/t/p/w342";
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

    const responseParsed = responseSchema.safeParse(response);
    if (!responseParsed.success) return null;
    return responseParsed.data;
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
    category,
    sort = tmdbDefaultSort,
    genres,
    page,
    language,
  }: {
    category: TTmdbCategory | undefined;
    sort: TTmdbSort | undefined;
    genres: TTmdbGenresValue[] | undefined;
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

    if (category) {
      const response = await this.fetch<z.infer<typeof responseSchema>>(
        `/movie/${category}?page=${page}&language=${language}`
      );
      return responseSchema.parse(response);
    }

    const genresString = genres?.join(",");

    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/discover/movie?language=${language}&page=${page}&sort_by=${sort}&with_genres=${genresString}`
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
    category,
    sort,
    genres,
  }: {
    query: string | undefined;
    language: keyof typeof languageCodes;
    page: number;
    category: TTmdbCategory | undefined;
    sort: TTmdbSort | undefined;
    genres: TTmdbGenresValue[] | undefined;
  }) {
    const rawMovies = query
      ? await this.getMoviesWithQuery({
          query,
          language,
          page,
        })
      : await this.getMoviesBySort({
          category,
          sort,
          genres,
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
