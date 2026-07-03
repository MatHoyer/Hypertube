import {
  DownloadState,
  DownloadStates,
  MOVIE_EVENTS,
  TGetMovieSSESchemas,
} from "@hypertube/libs";
import { getMovieQueue, TDownloadJobData } from "@hypertube/server-core";
import { Job } from "bullmq";
import { SSEStreamingApi } from "hono/streaming";
import { SSEClients } from "../../lib/SSEClients";

export const sseClients = new SSEClients();

let downloaderListenersRegistered = false;

export const ensureDownloaderQueueListeners = () => {
  if (downloaderListenersRegistered) return;
  downloaderListenersRegistered = true;

  const movieQueue = getMovieQueue();

  movieQueue.on("completed", (job) => {
    sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
      sendSSEDownloadStateChange(job.data, DownloadStates.DOWNLOADED, stream);
    });
  });
  movieQueue.on("failed", (job) => {
    sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
      sendSSEDownloadStateChange(
        job.data,
        DownloadStates.NOT_DOWNLOADED,
        stream
      );
    });
  });
  movieQueue.on("waiting", (job) => {
    sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
      sendSSEDownloadStateChange(job.data, DownloadStates.WAITING, stream);
    });
  });
  movieQueue.on("progress", (job) => {
    sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
      sendSSEProgress(job, stream);
    });
  });
};

const sendSSEDownloadStateChange = (
  jobData: TDownloadJobData,
  downloadState: DownloadState,
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.RESOLUTION_STATE_CHANGE,
    data: JSON.stringify({
      resolutionId: jobData.resolutionId,
      downloadState: downloadState,
    }),
  });
};

const sendSSEProgress = (
  job: Job<TDownloadJobData>,
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.RESOLUTION_DOWNLOAD_PROGRESS,
    data: JSON.stringify({
      resolutionId: job.data.resolutionId,
      progress: job.progress,
    }),
  });
};

export const sendSSESubtitleStateChange = (
  subtitle: TGetMovieSSESchemas["response"]["subtitleStateChange"],
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.SUBTITLE_STATE_CHANGE,
    data: JSON.stringify(subtitle),
  });
};
