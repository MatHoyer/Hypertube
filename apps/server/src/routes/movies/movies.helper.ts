import {
  DownloadState,
  MOVIE_EVENTS,
  Providers,
  TMovieSchema,
} from "@hypertube/libs";
import { prisma, TDownloadJobData } from "@hypertube/server-core";
import { Job } from "bullmq";
import { SSEStreamingApi } from "hono/streaming";
import { YtsProxyApi } from "../../lib/apis/yts-proxy.api";

export const getMovieData = async (movie: TMovieSchema) => {
  if (!movie.imdbId) throw new Error("Movie has no IMDB ID");

  const ytsProxyApi = new YtsProxyApi();

  const resolutions = await ytsProxyApi.getResolutions(movie.imdbId);
  await prisma.resolution.createMany({
    data: resolutions.map((resolution) => ({
      movieId: movie.id,
      resolution: resolution.quality,
      size: resolution.size,
      provider: Providers.YTS,
    })),
    skipDuplicates: true,
  });

  const subtitlesData = await ytsProxyApi.getSubtitles(movie.imdbId);
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

export const sendSSEDownloadStateChange = (
  jobData: TDownloadJobData,
  downloadState: DownloadState,
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.DOWNLOAD_STATE_CHANGE,
    data: JSON.stringify({
      resolution: jobData.resolution,
      downloadState: downloadState,
    }),
  });
};

export const sendSSEProgress = (
  job: Job<TDownloadJobData>,
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.DOWNLOAD_PROGRESS,
    data: JSON.stringify({
      resolution: job.data.resolution,
      progress: job.progress,
    }),
  });
};
