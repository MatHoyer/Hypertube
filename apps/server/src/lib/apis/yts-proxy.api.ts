import {
  TMovieSchema,
  TSubtitleSchema,
  TYtsMovieTorrentSchema,
} from "@hypertube/libs";
import { ApiBase, env } from "@hypertube/server-core";

export class YtsProxyApi extends ApiBase {
  constructor() {
    super(env.YTS_PROXY_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async getResolutions(imdbId: string) {
    const response = await this.fetch<TYtsMovieTorrentSchema[]>(
      `/resolutions/${imdbId}`
    );
    return response;
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
