import { Color } from "@/lib/color";
import { DownloadStates } from "@hypertube/libs";

export const DownloadStateColors = {
  [DownloadStates.DOWNLOADED]: new Color("text-green-500", "green"),
  [DownloadStates.DOWNLOADING]: new Color("text-orange-500", "orange"),
  [DownloadStates.WAITING]: new Color("text-blue-500", "blue"),
  [DownloadStates.NOT_DOWNLOADED]: new Color("text-red-500", "red"),
} as const;
