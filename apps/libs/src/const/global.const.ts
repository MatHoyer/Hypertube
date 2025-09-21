export const DownloadStates = {
  NOT_DOWNLOADED: "NOT_DOWNLOADED",
  DOWNLOADING: "DOWNLOADING",
  DOWNLOADED: "DOWNLOADED",
} as const;

export const languageCodes = {
  en: "English",
  fr: "Français",
  es: "Español",
} as const;

// 1 Mo
export const sizeMaxFile = 1024 * 1024;
