import { DownloadStates } from "@hypertube/libs";
import { getMovieByImdbId } from "../../lib/apis/yts.api";
import prisma from "../../lib/prisma";
import { getSubtitlesDownloadLinks } from "../../lib/scrappers/yifysubtitles.scrapper";

export const scrapMovieData = async (movieId: string) => {
  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });
  if (!movie) {
    return null;
  }

  const movieData = await getMovieByImdbId(movie.imdbId);
  const resolutionsData = movieData.torrents;

  await Promise.all(
    resolutionsData.map(async (resolution) => {
      return await prisma.resolution.upsert({
        where: {
          movieId_resolution: {
            movieId: movieId,
            resolution: resolution.quality,
          },
        },
        update: resolution,
        create: {
          movieId: movieId,
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
