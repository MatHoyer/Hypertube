import {
  capitalizeAllWords,
  TMovieSchema,
  ytsGenres,
  ytsQualities,
} from "@hypertube/libs";
import {
  createResolution,
  env,
  getResolutionPath,
} from "@hypertube/server-core";
import { writeFile } from "fs/promises";
import z from "zod";

const responseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    status: z.string(),
    status_message: z.string(),
    data: dataSchema,
  });

const ytsMovieTorrentSchema = z.object({
  url: z.string(),
  hash: z.string(),
  quality: z.enum(ytsQualities),
  size: z.string(),
});

const ytsMovieActorSchema = z.object({
  name: z.string(),
  character_name: z.string().optional(),
  imdb_code: z.string(),
  url_small_image: z.string().optional(),
});

const ytsMovieSchema = z.object({
  id: z.number(),
  url: z.url(),
  imdb_code: z.string(),
  title_english: z.string(),
  title_long: z.string(),
  slug: z.string().refine((slug) => !slug.includes(" "), {
    message: "Slug must not contain spaces",
  }),
  year: z.number(),
  rating: z.number(),
  runtime: z.number(),
  genres: z.array(
    z.enum(ytsGenres.map((genre) => capitalizeAllWords(genre, "-")))
  ),
  description_full: z.string().optional(),
  yt_trailer_code: z.string().optional(),
  language: z.string(),
  background_image: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  torrents: z.array(ytsMovieTorrentSchema),
  cast: z.array(ytsMovieActorSchema).optional().default([]),
});

export class YtsApi {
  private readonly ytsApiUrl: string;
  private readonly fetchOptions: RequestInit;

  constructor() {
    this.ytsApiUrl = env.YTS_API_URL;
    this.fetchOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(this.ytsApiUrl + url, {
      ...this.fetchOptions,
      ...options,
    });
    return response.json() as Promise<T>;
  }

  private async getMovieByImdbId(imdbId: string) {
    const localResponseSchema = responseSchema(
      z.object({
        movie: ytsMovieSchema,
      })
    );
    const response = await this.fetch<z.infer<typeof localResponseSchema>>(
      `/movie_details.json?imdb_id=${imdbId}`
    );
    return localResponseSchema.parse(response).data.movie;
  }

  public async getResolutions(imdbId: string) {
    const movie = await this.getMovieByImdbId(imdbId);
    return movie.torrents;
  }

  private async getResolution(imdbId: string, targetResolution: string) {
    const movie = await this.getMovieByImdbId(imdbId);

    const resolution = movie.torrents.find(
      (resolution) => resolution.quality === targetResolution
    );
    if (!resolution) {
      throw new Error(
        `Resolution (${targetResolution}) not found for movie ${imdbId}`
      );
    }

    return resolution;
  }

  public async downloadTorrent(movie: TMovieSchema, targetResolution: string) {
    if (!movie.imdbId) throw new Error("Movie has no IMDB ID");
    const resolution = await this.getResolution(movie.imdbId, targetResolution);

    const res = await fetch(resolution.url);
    if (!res.ok) {
      throw new Error(
        `Failed to download resolution for movie ${movie.imdbId}`
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await createResolution({
      movieId: movie.tmdbId,
      resolution: resolution.quality,
      forTransmission: false,
    });

    const outputPath = getResolutionPath({
      movieId: movie.tmdbId,
      resolution: resolution.quality,
      forTransmission: false,
      filename: "resolution.torrent",
    });
    await writeFile(outputPath, buffer);
  }
}
