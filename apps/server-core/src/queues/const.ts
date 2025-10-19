import { TMovieSchema } from "@hypertube/libs";

export const DOWNLOAD_QUEUE = "downloader";

export type TDownloadJobData = {
  movie: TMovieSchema;
  resolution: string;
};
