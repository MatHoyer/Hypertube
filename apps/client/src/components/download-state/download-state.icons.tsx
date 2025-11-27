import { DownloadStates } from "@hypertube/libs";
import { Check, Clock, XCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { AppLoader } from "../ui/app-loader";

export const DownloadStateIcons = {
  [DownloadStates.DOWNLOADED]: (props: ComponentProps<typeof Check>) => (
    <Check {...props} />
  ),
  [DownloadStates.WAITING]: (props: ComponentProps<typeof Clock>) => (
    <Clock {...props} />
  ),
  [DownloadStates.DOWNLOADING]: (props: ComponentProps<typeof AppLoader>) => (
    <AppLoader {...props} />
  ),
  [DownloadStates.NOT_DOWNLOADED]: (props: ComponentProps<typeof XCircle>) => (
    <XCircle {...props} />
  ),
} as const;
