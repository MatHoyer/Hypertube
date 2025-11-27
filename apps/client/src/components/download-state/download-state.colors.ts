import { DownloadStates } from "@hypertube/libs";

export const DownloadStateColors = {
  [DownloadStates.DOWNLOADED]: "var(--color-green-500)",
  [DownloadStates.DOWNLOADING]: "var(--color-orange-500)",
  [DownloadStates.WAITING]: "var(--color-blue-500)",
  [DownloadStates.NOT_DOWNLOADED]: "var(--color-red-500)",
} as const;
