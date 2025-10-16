import type { TMovieSchema } from "../schemas/database/movie.schema.js";

export const DOWNLOAD_QUEUE = "downloader";

export type TDownloadJobData = {
  movie: TMovieSchema;
  resolution: string;
};
