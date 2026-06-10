import { TMovieSchema, TResolutionSchema } from "@hypertube/libs";

export const DOWNLOAD_QUEUE = "downloader";

export type TDownloadJobData = {
  movie: TMovieSchema;
  resolutionId: TResolutionSchema["id"];
};
