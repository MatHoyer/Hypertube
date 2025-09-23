import { Providers } from "@hypertube/libs";
import { YtsApi } from "../apis/yts.api";

export const downloadTorrent = async ({
  provider,
  imdbId,
  resolution,
}: {
  provider: (typeof Providers)[keyof typeof Providers];
  imdbId: string;
  resolution: string;
}) => {
  switch (provider) {
    case Providers.YTS:
      await new YtsApi().downloadTorrent(imdbId, resolution);
      break;
    default:
      throw new Error(`Provider (${provider}) not supported`);
  }
};
