export const LOCAL_STORAGE_KEYS = {
  NOTIFICATIONS_MUTE: "notifications.mute",
} as const;
export type TLocalStorageKeys =
  (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];

export const WINDOW_MIN_WIDTH = {
  LG: 1024,
  MD: 768,
  SM: 640,
} as const;
