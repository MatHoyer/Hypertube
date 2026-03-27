import {
  formatUnknownError,
  hypertubeLogger,
  TMovieSchema,
  ytsQualities,
} from "@hypertube/libs";
import {
  ApiBase,
  BUCKETS,
  env,
  getMoviePath,
  minio,
} from "@hypertube/server-core";
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

const ytsMovieSchema = z.object({
  id: z.number(),
  torrents: z.array(ytsMovieTorrentSchema),
});

export class YtsApi extends ApiBase {
  constructor() {
    super(env.YTS_API_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    try {
      const movie = await this.getMovieByImdbId(imdbId);
      return movie.torrents;
    } catch (error) {
      hypertubeLogger.error(
        `Error getting resolutions: ${formatUnknownError(error)}`
      );
      return [];
    }
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

    minio.putObject(
      BUCKETS.MOVIES,
      getMoviePath(
        movie.tmdbId.toString(),
        resolution.quality,
        "resolution.torrent"
      ),
      buffer
    );
  }
}
