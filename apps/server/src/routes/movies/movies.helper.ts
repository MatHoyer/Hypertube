import { DownloadStates, Providers, TMovieSchema } from "@hypertube/libs";
import { YtsApi } from "../../lib/apis/yts.api";
import prisma from "../../lib/prisma";
import { getSubtitlesDownloadLinks } from "../../lib/scrappers/yifysubtitles.scrapper";

export const getMovieData = async (movie: TMovieSchema) => {
  const ytsApi = new YtsApi();

  const resolutions = await ytsApi.getResolutions(movie.imdbId);

  await Promise.all(
    resolutions.map(async (resolution) => {
      return await prisma.resolution.upsert({
        where: {
          movieId_resolution: {
            movieId: movie.id,
            resolution: resolution.quality,
          },
        },
        update: {
          size: resolution.size,
          resolution: resolution.quality,
          downloadState: DownloadStates.NOT_DOWNLOADED,
          provider: Providers.YTS,
        },
        create: {
          movieId: movie.id,
          resolution: resolution.quality,
          size: resolution.size,
          downloadState: DownloadStates.NOT_DOWNLOADED,
        },
      });
    })
  );

  const subtitlesData = await getSubtitlesDownloadLinks({
    imdbId: movie.imdbId,
  });

  await Promise.all(
    subtitlesData.map(
      async (subtitle) =>
        await prisma.subtitle.upsert({
          where: { downloadLink: subtitle.link },
          update: subtitle,
          create: {
            downloadLink: subtitle.link,
            language: subtitle.language,
            rating: subtitle.rating,
            movieId: movie.id,
          },
        })
    )
  );

  await prisma.movie.update({
    where: {
      id: movie.id,
    },
    data: {
      additionalInfoFetched: true,
    },
  });
};
