export const MOVIE_EVENTS = {
  DOWNLOAD_STATE_CHANGE: "downloadStateChange",
  DOWNLOAD_PROGRESS: "downloadProgress",
} as const;

export type TMovieEvents = (typeof MOVIE_EVENTS)[keyof typeof MOVIE_EVENTS];

export const NOTIFICATIONS_EVENTS = {
  NEW_NOTIFICATION: "newNotification",
} as const;

export type TNotificationsEvents =
  (typeof NOTIFICATIONS_EVENTS)[keyof typeof NOTIFICATIONS_EVENTS];
