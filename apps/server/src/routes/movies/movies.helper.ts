import {
  DownloadState,
  MOVIE_EVENTS,
  TGetMovieSSESchemas,
} from "@hypertube/libs";
import { TDownloadJobData } from "@hypertube/server-core";
import { Job } from "bullmq";
import { SSEStreamingApi } from "hono/streaming";

export const sendSSEDownloadStateChange = (
  jobData: TDownloadJobData,
  downloadState: DownloadState,
  stream: SSEStreamingApi
) => {
  stream.writeSSE({
    event: MOVIE_EVENTS.RESOLUTION_STATE_CHANGE,
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
    event: MOVIE_EVENTS.RESOLUTION_DOWNLOAD_PROGRESS,
    data: JSON.stringify({
      resolution: job.data.resolution,
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
