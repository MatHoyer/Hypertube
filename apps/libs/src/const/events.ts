export const SSEEvents = {
  DOWNLOAD_STATE_CHANGE: "downloadStateChange",
  DOWNLOAD_PROGRESS: "downloadProgress",
} as const;

export type SSEEvent = (typeof SSEEvents)[keyof typeof SSEEvents];
