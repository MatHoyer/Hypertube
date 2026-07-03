import { TMovieSchema, TResolutionSchema } from "@hypertube/libs";

export const MOVIE_QUEUE = "movie";

export const MOVIE_QUEUE_JOB_NAMES = {
  DOWNLOAD_MOVIE: "download-movie",
} as const;

export type TDownloadJobData = {
  movie: TMovieSchema;
  resolutionId: TResolutionSchema["id"];
};
