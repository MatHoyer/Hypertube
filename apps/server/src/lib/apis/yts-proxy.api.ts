import {
  TMovieSchema,
  TSubtitleSchema,
  TYtsMovieSchema,
} from "@hypertube/libs";
import { env } from "@hypertube/server-core";

export class YtsProxyApi {
  private readonly ytsApiUrl: string;
  private readonly fetchOptions: RequestInit;

  constructor() {
    this.ytsApiUrl = env.YTS_PROXY_URL;
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

  public async getResolutions(imdbId: string) {
    const response = await this.fetch<TYtsMovieSchema>(
      `/resolutions/${imdbId}`
    );
    return response.torrents;
  }

  public async downloadTorrent({
    movie,
    targetResolution,
  }: {
    movie: TMovieSchema;
    targetResolution: string;
  }) {
    if (!movie.imdbId) throw new Error("Movie has no IMDB ID");
    await this.fetch<{
      message: string;
    }>(`/resolutions/download`, {
      method: "POST",
      body: JSON.stringify({
        movie,
        resolution: targetResolution,
      }),
    });
  }

  public async getSubtitles(imdbId: string) {
    const response = await this.fetch<
      {
        language: string;
        rating: number;
        link: string;
      }[]
    >(`/subtitles/${imdbId}`);

    return response;
  }

  public async downloadSubtitles({
    subtitles,
    tmdbId,
  }: {
    subtitles: TSubtitleSchema;
    tmdbId: number;
  }) {
    await this.fetch<{
      message: string;
    }>(`/subtitles/download`, {
      method: "POST",
      body: JSON.stringify({
        subtitles,
        tmdbId,
      }),
    });
  }
}
