import { Providers, TMovieSchema } from "@hypertube/libs";
import { YtsApi } from "../../lib/apis/yts.api";
import prisma from "../../lib/prisma";
import { getSubtitlesDownloadLinks } from "../../lib/scrappers/yifysubtitles.scrapper";

export const getMovieData = async (movie: TMovieSchema) => {
  const ytsApi = new YtsApi();

  const resolutions = await ytsApi.getResolutions(movie.imdbId);
  await prisma.resolution.createMany({
    data: resolutions.map((resolution) => ({
      movieId: movie.id,
      resolution: resolution.quality,
      size: resolution.size,
      provider: Providers.YTS,
    })),
    skipDuplicates: true,
  });

  const subtitlesData = await getSubtitlesDownloadLinks({
    imdbId: movie.imdbId,
  });
  await prisma.subtitle.createMany({
    data: subtitlesData.map((subtitle) => ({
      movieId: movie.id,
      language: subtitle.language,
      rating: subtitle.rating,
      downloadLink: subtitle.link,
    })),
    skipDuplicates: true,
  });

  await prisma.movie.update({
    where: {
      id: movie.id,
    },
    data: {
      additionalInfoFetched: true,
    },
  });
};
