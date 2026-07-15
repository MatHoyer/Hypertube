import {
  DownloadStates,
  formatUnknownError,
  hypertubeLogger,
} from "@hypertube/libs";
import {
  getMovieQueue,
  MOVIE_QUEUE_JOB_NAMES,
  prisma,
  TDownloadJobData,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import { notifySubscribers } from "../../notifications/notifySubscriber.js";
import { downloadMovie } from "./movie-downloader.js";

export const downloadMovieHandler = async (job: Job<TDownloadJobData>) => {
  hypertubeLogger.info(`[${job.data.movie.id}] Download torrent job started`);

  await prisma.resolution.update({
    where: { id: job.data.resolutionId },
    data: { downloadState: DownloadStates.DOWNLOADING },
  });

  return downloadMovie(job);
};

export const downloadMovieSuccessHandler = async (
  job: Job<TDownloadJobData>
) => {
  hypertubeLogger.info(`[${job.data.movie.id}] Moviedownload success`);

  await prisma.resolution.update({
    where: {
      id: job.data.resolutionId,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
  try {
    await notifySubscribers(job.data.movie.id, DownloadStates.DOWNLOADED);
  } catch (error) {
    hypertubeLogger.error(
      `Error sending movie downloaded notification: ${formatUnknownError(error)}`
    );
  }

  await getMovieQueue().produce(MOVIE_QUEUE_JOB_NAMES.PREVIEW_MOVIE, {
    movie: job.data.movie,
    resolutionId: job.data.resolutionId,
  });
};

export const downloadMovieFailureHandler = async (
  job: Job<TDownloadJobData>,
  err: Error
) => {
  hypertubeLogger.error(
    `[${job?.data.movie.id}] Movie download failed: ${formatUnknownError(err)}`
  );
  if (!job?.data.movie.id || !job?.data.resolutionId) {
    hypertubeLogger.error(
      `[${job?.data.movie.id}] Can't update movie resolution download state : No movieId or resolutionId`
    );
    return;
  }

  await prisma.resolution.update({
    where: {
      id: job.data.resolutionId,
    },
    data: {
      downloadState: DownloadStates.NOT_DOWNLOADED,
    },
  });
};
