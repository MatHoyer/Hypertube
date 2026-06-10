export const DownloadStates = {
  NOT_DOWNLOADED: "NOT_DOWNLOADED",
  WAITING: "WAITING",
  DOWNLOADING: "DOWNLOADING",
  DOWNLOADED: "DOWNLOADED",
} as const;
export type DownloadState =
  (typeof DownloadStates)[keyof typeof DownloadStates];

export const StatTypes = {
  LIKES: "LIKES",
  COMMENTS: "COMMENTS",
} as const;

export type TStatType = (typeof StatTypes)[keyof typeof StatTypes];

export const ParentTypes = {
  MOVIE: "MOVIE",
  COMMENT: "COMMENT",
} as const;

export type TParentType = (typeof ParentTypes)[keyof typeof ParentTypes];

export const betterAuthProviders = [
  "google",
  "github",
  "discord",
  "school42",
] as const;
export type TBetterAuthProviders = (typeof betterAuthProviders)[number];

export const credentialId = "credential";

export const languageCodesArray = ["en", "fr", "es"] as const;
export type LanguageCode = (typeof languageCodesArray)[number];
export const languageCodes: Record<LanguageCode, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
} as const;
export const languageYTSCodes: Record<LanguageCode, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
} as const;

export const notificationReadStatuses = {
  ALL: "all",
  READ: "read",
  UNREAD: "unread",
} as const;
export const notificationReadStatusArray = [
  notificationReadStatuses.ALL,
  notificationReadStatuses.READ,
  notificationReadStatuses.UNREAD,
] as const;
export type NotificationReadStatus =
  (typeof notificationReadStatuses)[keyof typeof notificationReadStatuses];

// 1 Mo
export const sizeMaxFile = 1024 * 1024;
