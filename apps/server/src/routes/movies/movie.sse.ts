import {
  DownloadState,
  DownloadStates,
  MOVIE_EVENTS,
  TGetMovieSSESchemas,
} from "@hypertube/libs";
import {
  getMovieQueue,
  MOVIE_QUEUE_JOB_NAMES,
  TDownloadJobData,
} from "@hypertube/server-core";
import { SSEStreamingApi } from "hono/streaming";
import { SSEClients } from "../../lib/SSEClients";

export const sseClients = new SSEClients();

let downloaderListenersRegistered = false;

export const ensureDownloaderQueueListeners = () => {
  if (downloaderListenersRegistered) return;
  downloaderListenersRegistered = true;

  const movieQueue = getMovieQueue();

  movieQueue.on("completed", (job) => {
    switch (job.name) {
      case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
        sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
          sendSSEDownloadStateChange(
            job.data,
            DownloadStates.DOWNLOADED,
            stream
          );
        });
        return;
      case MOVIE_QUEUE_JOB_NAMES.PREVIEW_MOVIE:
        sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
          sendSSEPreviewStateChange(stream);
        });
        return;
    }
  });
  movieQueue.on("failed", (job) => {
    switch (job.name) {
      case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
        sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
          sendSSEDownloadStateChange(
            job.data,
            DownloadStates.NOT_DOWNLOADED,
            stream
          );
        });
        return;
    }
  });
  movieQueue.on("waiting", (job) => {
    switch (job.name) {
      case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
        sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
          sendSSEDownloadStateChange(job.data, DownloadStates.WAITING, stream);
        });
        return;
    }
  });
  movieQueue.on("active", (job) => {
    switch (job.name) {
      case MOVIE_QUEUE_JOB_NAMES.DOWNLOAD_MOVIE:
        sseClients.mapClients(job.data.movie.tmdbId.toString(), (stream) => {
          sendSSEDownloadStateChange(
            job.data,
            DownloadStates.DOWNLOADING,
            stream
          );
        });
        return;
    }
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

export const sendSSESubtitleStateChange = (
  subtitle: TGetMovieSSESchemas["response"]["subtitleStateChange"],
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.SUBTITLE_STATE_CHANGE,
    data: JSON.stringify(subtitle),
  });
};

const sendSSEPreviewStateChange = (stream: SSEStreamingApi) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.PREVIEW_STATE_CHANGE,
    data: "",
  });
};
