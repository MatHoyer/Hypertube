import type { DownloadState } from "@hypertube/libs";
import type { Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { DownloadStateColors } from "./download-state.colors";
import { DownloadStateIcons } from "./download-state.icons";

export const getDownloadStateIcon = (
  downloadState: DownloadState,
  props?: ComponentProps<typeof Icon>
) => {
  return DownloadStateIcons[downloadState]({
    color: DownloadStateColors[downloadState],
    ...props,
  });
};
