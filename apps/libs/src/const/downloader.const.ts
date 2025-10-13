import type { TMovieSchema } from "../schemas/database/movie.schema.js";

export const DOWNLOAD_QUEUE = "downloader";

export type TJobData = {
  movie: TMovieSchema;
  resolution: string;
};
