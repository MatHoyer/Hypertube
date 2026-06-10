import { TSubtitleSchema } from "@hypertube/libs";
import { ApiBase, env } from "@hypertube/server-core";

export class SubtitleProxyApi extends ApiBase {
  constructor() {
    super(env.SUBTITLE_PROXY_URL, {
      headers: {
        "Content-Type": "application/json",
      },
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
    return await this.fetch<{
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
