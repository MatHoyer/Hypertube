import { languageCodes, tmdbMovieSchema } from "@hypertube/libs";
import z from "zod";
import { env } from "../../env";

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

  private async getMovieDetailsByTmdbId(tmdbId: number) {
    const responseSchema = tmdbMovieSchema;
    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/movie/${tmdbId}`
    );
    return responseSchema.parse(response);
  }

  private async getAllMovieDetails(movieIds: number[]) {
    const moviePromises = movieIds.map(async (movieId) => {
      return await this.getMovieDetailsByTmdbId(movieId);
    });

    return await Promise.all(moviePromises);
  }

  private async getMoviesByType({
    type,
    page,
    language,
  }: {
    type: "popular" | "top_rated" | "upcoming" | "now_playing";
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
    const response = await this.fetch<z.infer<typeof responseSchema>>(
      `/movie/${type}?page=${page}&language=${language}`
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
  }: {
    query: string | undefined;
    language: keyof typeof languageCodes;
    page: number;
  }) {
    const rawMovies = query
      ? await this.getMoviesWithQuery({
          query,
          language,
          page,
        })
      : await this.getMoviesByType({
          type: "popular",
          page,
          language,
        });

    const movies = await this.getAllMovieDetails(
      rawMovies.results.map((movie) => movie.id)
    );

    return {
      movies,
      page: rawMovies.page,
      totalPages: rawMovies.total_pages,
      totalResults: rawMovies.total_results,
    };
  }

  public async getMovie(movieId: number) {
    return await this.getMovieDetailsByTmdbId(movieId);
  }
}
