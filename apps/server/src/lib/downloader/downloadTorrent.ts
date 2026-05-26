import { Providers, TMovieSchema, TResolutionSchema } from "@hypertube/libs";
import { YtsProxyApi } from "../apis/yts-proxy.api";
import { getDownloaderQueue } from "../queues/downloader";

export const downloadTorrent = async ({
  movie,
  resolution,
}: {
  movie: TMovieSchema;
  resolution: TResolutionSchema;
}) => {
  switch (resolution.provider) {
    case Providers.YTS:
      await new YtsProxyApi().downloadTorrent({
        movie,
        targetResolution: resolution.resolution,
      });
      break;
    default:
      throw new Error(`Provider (${resolution.provider}) not supported`);
  }

  await getDownloaderQueue().produce("download", {
    movie,
    resolution: resolution.resolution,
  });
};
