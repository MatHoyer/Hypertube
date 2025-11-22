import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import type { DownloadState, TGetMovieSchemas } from "@hypertube/libs";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DownloadButton } from "./download-selector.utils";

const DownloadResolutionButton: React.FC<{
  resolution: string;
  size: string;
  downloadState: DownloadState;
}> = ({ resolution, size, downloadState }) => {
  return (
    <DownloadButton downloadState={downloadState}>
      <Typography variant="small">{resolution}</Typography>
      <Typography variant="xs" textColor="muted">
        {size}
      </Typography>
      <div className="flex items-center justify-between w-full mt-2">
        <Badge variant="secondary">MP4</Badge>
        {getDownloadStateIcon(downloadState)}
      </div>
    </DownloadButton>
  );
};

export const DownloadResolutionSelector: React.FC<{
  resolutions: TGetMovieSchemas["response"]["resolutions"];
}> = ({ resolutions }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Download size={20} />
        <Typography>{t("movie.downloadPage.resolutions")}</Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        {resolutions.map((resolution) => (
          <DownloadResolutionButton
            key={resolution.id}
            resolution={resolution.resolution}
            size={resolution.size}
            downloadState={resolution.downloadState}
          />
        ))}
      </div>
    </div>
  );
};
