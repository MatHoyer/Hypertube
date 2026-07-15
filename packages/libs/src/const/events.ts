export const MOVIE_EVENTS = {
  RESOLUTION_STATE_CHANGE: "resolutionStateChange",
  SUBTITLE_STATE_CHANGE: "subtitleStateChange",
} as const;

export type TMovieEvents = (typeof MOVIE_EVENTS)[keyof typeof MOVIE_EVENTS];

export const NOTIFICATIONS_EVENTS = {
  NEW_NOTIFICATION: "newNotification",
} as const;

export type TNotificationsEvents =
  (typeof NOTIFICATIONS_EVENTS)[keyof typeof NOTIFICATIONS_EVENTS];
