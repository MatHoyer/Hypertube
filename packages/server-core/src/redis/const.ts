import { TMovieSchema, TResolutionSchema } from "@hypertube/libs";

export const MOVIE_QUEUE = "movie";

export type TDownloadJobData = {
  movie: TMovieSchema;
  resolutionId: TResolutionSchema["id"];
};
