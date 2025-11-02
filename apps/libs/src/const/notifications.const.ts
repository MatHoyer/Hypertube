export const notifications = {
  TEST: "test",
  MOVIE_DOWNLOADED: "movieDownloaded",
  MOVIE_DOWNLOADING: "movieDownloading",
} as const;

export type TNotification = (typeof notifications)[keyof typeof notifications];
