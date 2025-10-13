import { Providers, TMovieSchema, TResolutionSchema } from "@hypertube/libs";
import { YtsApi } from "../apis/yts.api";
import { produceDownload } from "../download-queue/download.produce";

export const downloadTorrent = async ({
  movie,
  resolution,
}: {
  movie: TMovieSchema;
  resolution: TResolutionSchema;
}) => {
  switch (resolution.provider) {
    case Providers.YTS:
      await new YtsApi().downloadTorrent(movie, resolution.resolution);
      break;
    default:
      throw new Error(`Provider (${resolution.provider}) not supported`);
  }

  await produceDownload({
    movie,
    resolution: resolution.resolution,
  });
};
